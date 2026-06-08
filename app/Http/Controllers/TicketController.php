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

        return response()->json($ticket->load('assignee', 'creator', 'comments.user'), 201);
    }

    // PUT /api/projects/{project}/tickets/{ticket} — owner only
    public function update(Request $request, Project $project, Ticket $ticket): JsonResponse
    {
        $this->authorizeOwner($project, $request);

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'in:low,medium,high',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $ticket->update($validated);

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
        // Owners can move anywhere including review→done, review→in_progress, done→archived
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
}