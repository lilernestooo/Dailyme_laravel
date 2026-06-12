<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $admin  = User::where('email', 'admin@example.com')->first();
        $qa     = User::where('email', 'qa@example.com')->first();
        $dev1   = User::where('email', 'dev1@example.com')->first();
        $dev2   = User::where('email', 'dev2@example.com')->first();
        $pm     = User::where('email', 'pm@example.com')->first();

        $projects = [
            [
                'owner_id'    => $admin->id,
                'name'        => 'Website Redesign',
                'description' => 'Full overhaul of the company website including new design system.',
                'qa_required' => true,
            ],
            [
                'owner_id'    => $pm->id,
                'name'        => 'Mobile App v2',
                'description' => 'Second major release of the mobile application with new features.',
                'qa_required' => true,
            ],
            [
                'owner_id'    => $dev1->id,
                'name'        => 'Internal Tools',
                'description' => 'Internal developer tooling and automation scripts.',
                'qa_required' => false,
            ],
            [
                'owner_id'    => $pm->id,
                'name'        => 'API Gateway',
                'description' => 'Centralised API gateway for all microservices.',
                'qa_required' => true,
            ],
        ];

        foreach ($projects as $data) {
            $project = Project::create($data);

            // Always add the owner as 'owner' in project_members
            ProjectMember::create([
                'project_id' => $project->id,
                'user_id'    => $project->owner_id,
                'role'       => 'owner',
            ]);

            // Add QA member if QA is required
            if ($project->qa_required) {
                ProjectMember::create([
                    'project_id' => $project->id,
                    'user_id'    => $qa->id,
                    'role'       => 'qa',
                ]);
            }

            // Add developers as regular members (skip if already added as owner)
            $members = [$dev1, $dev2];
            foreach ($members as $member) {
                if ($member->id !== $project->owner_id) {
                    ProjectMember::create([
                        'project_id' => $project->id,
                        'user_id'    => $member->id,
                        'role'       => 'member',
                    ]);
                }
            }

            // Add pm as member on projects they don't own
            if ($pm->id !== $project->owner_id) {
                ProjectMember::create([
                    'project_id' => $project->id,
                    'user_id'    => $pm->id,
                    'role'       => 'member',
                ]);
            }
        }
    }
}