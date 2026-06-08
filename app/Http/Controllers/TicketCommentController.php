<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Ticket;
use App\Models\TicketComment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TicketCommentController extends Controller
{
    // POST /api/projects/{project}/tickets/{ticket}/comments
    public function store(Request $request, Project $project, Ticket $ticket): JsonResponse
    {
        $isOwner = $project->isOwner($request->user()->id);
        $isMember = $project->isMember($request->user()->id);

        if (!$isOwner && !$isMember) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'comment' => 'required|string',
            'type'    => 'in:comment,approve,reject',
        ]);

        // Only owner can approve or reject
        if (in_array($validated['type'] ?? 'comment', ['approve', 'reject']) && !$isOwner) {
            abort(403, 'Only the project owner can approve or reject tickets.');
        }

        $comment = TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id'   => $request->user()->id,
            'comment'   => $validated['comment'],
            'type'      => $validated['type'] ?? 'comment',
        ]);

        // Auto move ticket based on approval
        if ($validated['type'] === 'approve' && $isOwner) {
            $ticket->update(['status' => 'done']);
        } elseif ($validated['type'] === 'reject' && $isOwner) {
            $ticket->update(['status' => 'in_progress']);
        }

        return response()->json($comment->load('user'), 201);
    }
}