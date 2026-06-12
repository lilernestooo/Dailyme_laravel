<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\Project;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $dev1 = User::where('email', 'dev1@example.com')->first();
        $dev2 = User::where('email', 'dev2@example.com')->first();
        $qa   = User::where('email', 'qa@example.com')->first();
        $pm   = User::where('email', 'pm@example.com')->first();

        $projects = Project::with('tickets')->get();

        foreach ($projects as $project) {
            foreach ($project->tickets as $ticket) {
                $this->seedTicketNotifications($ticket, $project, $dev1, $dev2, $qa, $pm);
            }
        }
    }

    private function seedTicketNotifications(
        Ticket $ticket,
        Project $project,
        User $dev1,
        User $dev2,
        User $qa,
        User $pm
    ): void {
        // Notify assigned user when a ticket is assigned
        if ($ticket->assigned_to) {
            $assignee = User::find($ticket->assigned_to);
            Notification::create([
                'user_id'    => $assignee->id,
                'project_id' => $project->id,
                'ticket_id'  => $ticket->id,
                'type'       => 'assigned',
                'message'    => "You were assigned to ticket: \"{$ticket->title}\"",
                'is_read'    => in_array($ticket->status, ['done', 'archived', 'qa_approved']),
            ]);
        }

        // Notify PM when a ticket moves to review
        if (in_array($ticket->status, ['review', 'qa_approved', 'done'])) {
            Notification::create([
                'user_id'    => $pm->id,
                'project_id' => $project->id,
                'ticket_id'  => $ticket->id,
                'type'       => 'moved_to_review',
                'message'    => "Ticket \"{$ticket->title}\" was moved to review.",
                'is_read'    => in_array($ticket->status, ['done', 'archived']),
            ]);
        }

        // Notify QA when ticket is qa_approved
        if ($ticket->status === 'qa_approved' && $project->qa_required) {
            Notification::create([
                'user_id'    => $qa->id,
                'project_id' => $project->id,
                'ticket_id'  => $ticket->id,
                'type'       => 'approved',
                'message'    => "Ticket \"{$ticket->title}\" has been QA approved.",
                'is_read'    => true,
            ]);
        }

        // Notify ticket creator when there is a comment (simulate activity)
        if (in_array($ticket->status, ['review', 'in_progress'])) {
            $creator = User::find($ticket->created_by);
            if ($creator) {
                Notification::create([
                    'user_id'    => $creator->id,
                    'project_id' => $project->id,
                    'ticket_id'  => $ticket->id,
                    'type'       => 'commented',
                    'message'    => "New comment on ticket: \"{$ticket->title}\"",
                    'is_read'    => false,
                ]);
            }
        }
    }
}