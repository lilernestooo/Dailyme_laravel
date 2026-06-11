<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
    // GET /api/projects/{project}/tickets
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorizeMember($project, $request);

        $tickets = $project->tickets()
            ->with(['assignee', 'creator', 'comments.user'])
            ->orderBy('order')
            ->get()
            ->groupBy('status');

        return response()->json([
            'todo'        => $tickets->get('todo', collect()),
            'in_progress' => $tickets->get('in_progress', collect()),
            'review'      => $tickets->get('review', collect()),
            'qa_approved' => $tickets->get('qa_approved', collect()),
            'done'        => $tickets->get('done', collect()),
            'archived'    => $tickets->get('archived', collect()),
        ]);
    }

    // POST /api/projects/{project}/tickets — owner only
    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorizeOwner($project, $request);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'in:low,medium,high',
            'assigned_to' => 'nullable|exists:users,id',
            'progress'    => 'integer|min:0|max:100',
        ]);

        $maxOrder = Ticket::where('project_id', $project->id)
            ->where('status', 'todo')
            ->max('order') ?? -1;

        $ticket = Ticket::create([
            ...$validated,
            'project_id' => $project->id,
            'created_by' => $request->user()->id,
            'status'     => 'todo',
            'order'      => $maxOrder + 1,
            'progress'   => $validated['progress'] ?? 0,
        ]);

        if (!empty($validated['assigned_to'])) {
            $this->createNotification(
                $validated['assigned_to'],
                $project->id,
                $ticket->id,
                'assigned',
                "{$request->user()->name} assigned you a ticket: \"{$ticket->title}\""
            );
        }

        return response()->json($ticket->load('assignee', 'creator', 'comments.user'), 201);
    }

    // PUT /api/projects/{project}/tickets/{ticket}
    public function update(Request $request, Project $project, Ticket $ticket): JsonResponse
    {
        $userId  = $request->user()->id;
        $isOwner = $project->isOwner($userId);
        $isQA    = $project->isQA($userId);

        // Must be at least a member
        if (!$isOwner && !$project->isMember($userId)) {
            abort(403, 'Unauthorized');
        }

        // Members and QA can only update progress
        if (!$isOwner) {
            $validated = $request->validate([
                'progress' => 'required|integer|min:0|max:100',
            ]);
            $ticket->update(['progress' => $validated['progress']]);
            return response()->json($ticket->load('assignee', 'creator', 'comments.user'));
        }

        // Owner can update everything
        $oldAssignee = $ticket->assigned_to;

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'in:low,medium,high',
            'assigned_to' => 'nullable|exists:users,id',
            'progress'    => 'integer|min:0|max:100',
        ]);

        $ticket->update($validated);

        if (!empty($validated['assigned_to']) && $validated['assigned_to'] != $oldAssignee) {
            $this->createNotification(
                $validated['assigned_to'],
                $project->id,
                $ticket->id,
                'assigned',
                "{$request->user()->name} assigned you a ticket: \"{$ticket->title}\""
            );
        }

        return response()->json($ticket->load('assignee', 'creator', 'comments.user'));
    }

    // PATCH /api/projects/{project}/tickets/{ticket}/move
    public function move(Request $request, Project $project, Ticket $ticket): JsonResponse
    {
        $this->authorizeMember($project, $request);

        $validated = $request->validate([
            'status' => 'required|in:todo,in_progress,review,qa_approved,done,archived',
        ]);

        $user       = $request->user();
        $newStatus  = $validated['status'];
        $oldStatus  = $ticket->status;
        $isOwner    = $project->isOwner($user->id);
        $qaRequired = $project->qa_required;

        // Derive role
        $role = 'member';
        if ($isOwner) {
            $role = 'owner';
        } elseif ($project->isQA($user->id)) {
            $role = 'qa';
        }

        // ---- Permission matrix ----
        $allowed = false;

        if ($role === 'owner') {
            if ($qaRequired && $oldStatus === 'review' && in_array($newStatus, ['in_progress', 'done'])) {
                abort(403, 'QA must review this ticket first.');
            }
            $allowed = true;
        }

        if ($role === 'member') {
            $memberAllowed = [
                'todo'        => ['in_progress'],
                'in_progress' => ['review'],
            ];
            $allowed = in_array($newStatus, $memberAllowed[$oldStatus] ?? []);
        }

        if ($role === 'qa') {
            if (!$qaRequired) {
                abort(403, 'QA role is not active on this project.');
            }
            if ($oldStatus !== 'review') {
                abort(403, 'QA can only act on tickets in Review.');
            }
            $allowed = in_array($newStatus, ['qa_approved', 'in_progress']);
        }

        if (!$allowed) {
            abort(403, 'You are not allowed to make this move.');
        }

        $maxOrder = Ticket::where('project_id', $project->id)
            ->where('status', $newStatus)
            ->max('order') ?? -1;

        $ticket->update(['status' => $newStatus, 'order' => $maxOrder + 1]);

        // ---- Notifications ----

        if ($newStatus === 'review') {
            if ($qaRequired) {
                $qaMembers = $project->members()->where('role', 'qa')->get();
                foreach ($qaMembers as $qaMember) {
                    $this->createNotification(
                        $qaMember->user_id,
                        $project->id,
                        $ticket->id,
                        'qa_review_needed',
                        "{$user->name} moved \"{$ticket->title}\" to Review — QA needed"
                    );
                }
            } else {
                $this->createNotification(
                    $project->owner_id,
                    $project->id,
                    $ticket->id,
                    'moved_to_review',
                    "{$user->name} moved \"{$ticket->title}\" to Review"
                );
            }
        }

        if ($newStatus === 'qa_approved') {
            $this->createNotification(
                $project->owner_id,
                $project->id,
                $ticket->id,
                'qa_passed',
                "{$user->name} (QA) approved \"{$ticket->title}\" — ready for your sign-off"
            );
        }

        if ($role === 'qa' && $newStatus === 'in_progress') {
            $this->createNotification(
                $project->owner_id,
                $project->id,
                $ticket->id,
                'qa_rejected',
                "{$user->name} (QA) rejected \"{$ticket->title}\" — sent back to In Progress"
            );
            if ($ticket->assigned_to && $ticket->assigned_to !== $project->owner_id) {
                $this->createNotification(
                    $ticket->assigned_to,
                    $project->id,
                    $ticket->id,
                    'qa_rejected',
                    "QA rejected \"{$ticket->title}\" — check the feedback and fix it"
                );
            }
        }

        if ($role === 'owner' && $newStatus === 'done' && $ticket->assigned_to) {
            $this->createNotification(
                $ticket->assigned_to,
                $project->id,
                $ticket->id,
                'approved',
                "{$user->name} approved \"{$ticket->title}\" — moved to Done"
            );
        }

        return response()->json($ticket->load('assignee', 'creator', 'comments.user'));
    }

    // DELETE /api/projects/{project}/tickets/{ticket} — owner only
    public function destroy(Request $request, Project $project, Ticket $ticket): JsonResponse
    {
        $this->authorizeOwner($project, $request);
        $ticket->delete();
        return response()->json(['message' => 'Ticket deleted']);
    }

    private function authorizeMember(Project $project, Request $request): void
    {
        if (!$project->isMember($request->user()->id) && !$project->isOwner($request->user()->id)) {
            abort(403, 'Unauthorized');
        }
    }

    private function authorizeOwner(Project $project, Request $request): void
    {
        if ($project->owner_id !== $request->user()->id) {
            abort(403, 'Only the project owner can do this.');
        }
    }

    private function createNotification(int $userId, int $projectId, ?int $ticketId, string $type, string $message): void
    {
        if ($userId === request()->user()->id) return;

        \App\Models\Notification::create([
            'user_id'    => $userId,
            'project_id' => $projectId,
            'ticket_id'  => $ticketId,
            'type'       => $type,
            'message'    => $message,
        ]);
    }
}