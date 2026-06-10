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
        $user     = $request->user();
        $isOwner  = $project->isOwner($user->id);
        $isMember = $project->isMember($user->id);
        $isQA     = $project->isQA($user->id);           // ← added

        if (!$isOwner && !$isMember) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'comment' => 'required|string',
            'type'    => 'in:comment,approve,reject,qa_feedback',   // ← added qa_feedback
        ]);

        $type = $validated['type'] ?? 'comment';

        // approve/reject — owner only
        if (in_array($type, ['approve', 'reject']) && !$isOwner) {
            abort(403, 'Only the project owner can approve or reject tickets.');
        }

        // qa_feedback — QA only, and only on tickets in review
        if ($type === 'qa_feedback') {
            if (!$isQA) {
                abort(403, 'Only QA members can leave QA feedback.');
            }
            if ($ticket->status !== 'review') {
                abort(422, 'QA feedback can only be added to tickets in Review.');
            }
        }

        $comment = TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id'   => $user->id,
            'comment'   => $validated['comment'],
            'type'      => $type,
        ]);

        // Auto-move ticket based on comment type
        // approve/reject are owner actions — no QA project check needed,
        // owner already cannot reach done/in_progress from review in QA projects
        // via the move endpoint, so these are safe legacy paths for non-QA projects.
        if ($type === 'approve' && $isOwner) {
            $ticket->update(['status' => 'done']);
        } elseif ($type === 'reject' && $isOwner) {
            $ticket->update(['status' => 'in_progress']);
        }
        // qa_feedback does NOT auto-move — QA moves the ticket separately via the move endpoint

        // ---- Notifications ----
        $actor = $user->name;
        $title = $ticket->title;

        if ($type === 'approve') {
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
            if ($ticket->assigned_to) {
                $this->createNotification(
                    $ticket->assigned_to,
                    $project->id,
                    $ticket->id,
                    'rejected',
                    "{$actor} rejected your ticket: \"{$title}\" — please revise."
                );
            }

        } elseif ($type === 'qa_feedback') {
            // Notify owner that QA left feedback
            $this->createNotification(
                $project->owner_id,
                $project->id,
                $ticket->id,
                'qa_feedback',
                "{$actor} (QA) left feedback on \"{$title}\""
            );
            // Notify assignee so they know what to fix
            if ($ticket->assigned_to && $ticket->assigned_to !== $project->owner_id) {
                $this->createNotification(
                    $ticket->assigned_to,
                    $project->id,
                    $ticket->id,
                    'qa_feedback',
                    "{$actor} (QA) left feedback on your ticket: \"{$title}\""
                );
            }

        } else {
            // Regular comment — notify creator
            if ($ticket->created_by !== $user->id) {
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
                $ticket->assigned_to !== $user->id &&
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