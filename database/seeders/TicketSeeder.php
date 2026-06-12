<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $qa   = User::where('email', 'qa@example.com')->first();
        $dev1 = User::where('email', 'dev1@example.com')->first();
        $dev2 = User::where('email', 'dev2@example.com')->first();
        $pm   = User::where('email', 'pm@example.com')->first();

        $projects = Project::all();

        // Ticket templates covering every status, priority, and progress value
        $ticketTemplates = [
            [
                'title'       => 'Set up project repository',
                'description' => 'Initialise Git repository, configure CI pipeline, and set up branch protection rules.',
                'status'      => 'done',
                'priority'    => 'high',
                'order'       => 1,
                'progress'    => 100,
                'assigned_to' => $dev1->id,
            ],
            [
                'title'       => 'Design system tokens',
                'description' => 'Define colour palette, spacing scale, and typography tokens in Figma and export to CSS variables.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'order'       => 2,
                'progress'    => 60,
                'assigned_to' => $dev1->id,
            ],
            [
                'title'       => 'User authentication flow',
                'description' => 'Implement login, registration, password reset, and email verification using Sanctum.',
                'status'      => 'review',
                'priority'    => 'high',
                'order'       => 3,
                'progress'    => 90,
                'assigned_to' => $dev2->id,
            ],
            [
                'title'       => 'Dashboard analytics widgets',
                'description' => 'Build chart components for daily active users, revenue, and conversion rate.',
                'status'      => 'qa_approved',
                'priority'    => 'medium',
                'order'       => 4,
                'progress'    => 100,
                'assigned_to' => $dev2->id,
            ],
            [
                'title'       => 'Notification email templates',
                'description' => 'Create Blade email templates for assignment, approval, and rejection notifications.',
                'status'      => 'todo',
                'priority'    => 'medium',
                'order'       => 5,
                'progress'    => 0,
                'assigned_to' => null,
            ],
            [
                'title'       => 'API rate limiting',
                'description' => 'Apply per-user rate limiting on all public API endpoints using Laravel throttle middleware.',
                'status'      => 'todo',
                'priority'    => 'low',
                'order'       => 6,
                'progress'    => 0,
                'assigned_to' => null,
            ],
            [
                'title'       => 'Export to CSV feature',
                'description' => 'Allow users to export ticket lists and reports as CSV files.',
                'status'      => 'in_progress',
                'priority'    => 'medium',
                'order'       => 7,
                'progress'    => 35,
                'assigned_to' => $dev1->id,
            ],
            [
                'title'       => 'Mobile responsive layout',
                'description' => 'Ensure all views are fully responsive down to 375px viewport width.',
                'status'      => 'archived',
                'priority'    => 'low',
                'order'       => 8,
                'progress'    => 0,
                'assigned_to' => null,
            ],
        ];

        foreach ($projects as $project) {
            // Determine the creator — the project owner
            $creator = User::find($project->owner_id);

            foreach ($ticketTemplates as $index => $template) {
                $ticket = Ticket::create([
                    'project_id'  => $project->id,
                    'created_by'  => $creator->id,
                    'assigned_to' => $template['assigned_to'],
                    'title'       => $template['title'],
                    'description' => $template['description'],
                    'status'      => $template['status'],
                    'priority'    => $template['priority'],
                    'order'       => $template['order'],
                    'progress'    => $template['progress'],
                ]);

                // Add comments based on ticket status to simulate real workflow
                $this->seedComments($ticket, $dev1, $dev2, $qa, $pm, $project->qa_required);
            }
        }
    }

    private function seedComments(
        Ticket $ticket,
        User $dev1,
        User $dev2,
        User $qa,
        User $pm,
        bool $qaRequired
    ): void {
        match ($ticket->status) {
            'in_progress' => $this->addComment(
                $ticket,
                $dev1,
                'Working on this — will push a draft PR by end of day.',
                'comment'
            ),

            'review' => $this->addComments($ticket, [
                [$dev2,  'PR is up for review. All tests passing.', 'comment'],
                [$pm,    'Left a few minor suggestions inline on the PR.', 'comment'],
                [$dev2,  'Addressed all review comments. Ready for final sign-off.', 'comment'],
            ]),

            'qa_approved' => $this->addComments($ticket, [
                [$dev1,  'Feature complete. Moving to QA.', 'comment'],
                [$qa,    'Tested on staging. Everything looks good.', $qaRequired ? 'approve' : 'comment'],
                [$qa,    'QA sign-off complete. Ready to merge.', $qaRequired ? 'qa_feedback' : 'comment'],
            ]),

            'done' => $this->addComments($ticket, [
                [$dev1,  'Completed and merged to main.', 'comment'],
                [$pm,    'Verified in production. Closing ticket.', 'comment'],
            ]),

            'archived' => $this->addComments($ticket, [
                [$pm,    'Deprioritised — archiving for now.', 'comment'],
            ]),

            default => null, // todo — no comments yet
        };
    }

    private function addComment(Ticket $ticket, User $user, string $text, string $type): void
    {
        TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id'   => $user->id,
            'comment'   => $text,
            'type'      => $type,
        ]);
    }

    private function addComments(Ticket $ticket, array $comments): void
    {
        foreach ($comments as [$user, $text, $type]) {
            $this->addComment($ticket, $user, $text, $type);
        }
    }
}