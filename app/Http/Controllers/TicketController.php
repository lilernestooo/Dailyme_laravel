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
        ]);

        // Notify assigned member
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

    // PUT /api/projects/{project}/tickets/{ticket} — owner only
    public function update(Request $request, Project $project, Ticket $ticket): JsonResponse
    {
        $this->authorizeOwner($project, $request);

        $oldAssignee = $ticket->assigned_to;

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'in:low,medium,high',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $ticket->update($validated);

        // Notify newly assigned member if assignee changed
        if (
            !empty($validated['assigned_to']) &&
            $validated['assigned_to'] != $oldAssignee
        ) {
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
            'status' => 'required|in:todo,in_progress,review,done,archived',
        ]);

        $isOwner   = $project->isOwner($request->user()->id);
        $newStatus = $validated['status'];
        $oldStatus = $ticket->status;

        // Members can only move: todo→in_progress, in_progress→review
        // Owners can move anywhere
        $memberAllowed = [
            'todo'        => ['in_progress'],
            'in_progress' => ['review'],
        ];

        if (!$isOwner) {
            $allowed = $memberAllowed[$oldStatus] ?? [];
            if (!in_array($newStatus, $allowed)) {
                abort(403, 'You are not allowed to make this move.');
            }
        }

        $maxOrder = Ticket::where('project_id', $project->id)
            ->where('status', $newStatus)
            ->max('order') ?? -1;

        $ticket->update(['status' => $newStatus, 'order' => $maxOrder + 1]);

        // Notify owner when ticket moves to review
        if ($newStatus === 'review' && !$isOwner) {
            $this->createNotification(
                $project->owner_id,
                $project->id,
                $ticket->id,
                'moved_to_review',
                "{$request->user()->name} moved \"{$ticket->title}\" to Review"
            );
        }

        // Notify assignee when owner moves ticket to done
        if ($newStatus === 'done' && $isOwner && $ticket->assigned_to) {
            $this->createNotification(
                $ticket->assigned_to,
                $project->id,
                $ticket->id,
                'approved',
                "{$request->user()->name} moved \"{$ticket->title}\" to Done"
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
        // Don't notify yourself
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