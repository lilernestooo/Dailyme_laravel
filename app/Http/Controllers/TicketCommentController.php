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
        $isOwner  = $project->isOwner($request->user()->id);
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

        // Send notifications
        $actor = $request->user()->name;
        $title = $ticket->title;
        $type  = $validated['type'] ?? 'comment';

        if ($type === 'approve') {
            // Notify assignee — ticket approved
            if ($ticket->assigned_to) {
                $this->createNotification(
                    $ticket->assigned_to,
                    $project->id,
                    $ticket->id,
                    'approved',
                    "{$actor} approved your ticket: \"{$title}\""
                );
            }
        } elseif ($type === 'reject') {
            // Notify assignee — ticket rejected
            if ($ticket->assigned_to) {
                $this->createNotification(
                    $ticket->assigned_to,
                    $project->id,
                    $ticket->id,
                    'rejected',
                    "{$actor} rejected your ticket: \"{$title}\" — please revise."
                );
            }
        } else {
            // Regular comment — notify ticket creator
            if ($ticket->created_by !== $request->user()->id) {
                $this->createNotification(
                    $ticket->created_by,
                    $project->id,
                    $ticket->id,
                    'commented',
                    "{$actor} commented on \"{$title}\""
                );
            }
            // Also notify assignee if different from commenter and creator
            if (
                $ticket->assigned_to &&
                $ticket->assigned_to !== $request->user()->id &&
                $ticket->assigned_to !== $ticket->created_by
            ) {
                $this->createNotification(
                    $ticket->assigned_to,
                    $project->id,
                    $ticket->id,
                    'commented',
                    "{$actor} commented on \"{$title}\""
                );
            }
        }

        return response()->json($comment->load('user'), 201);
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