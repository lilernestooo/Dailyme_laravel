<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    // GET /api/projects — list all projects the user is part of
    public function index(Request $request): JsonResponse
    {
        $projects = Project::where('owner_id', $request->user()->id)
            ->orWhereHas('members', fn($q) => $q->where('user_id', $request->user()->id))
            ->with(['owner', 'members.user'])
            ->get()
            ->map(function ($project) use ($request) {
                $project->is_owner = $project->owner_id === $request->user()->id;
                return $project;
            });

        return response()->json($projects);
    }

    // POST /api/projects — create a new project
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $project = Project::create([
            ...$validated,
            'owner_id' => $request->user()->id,
        ]);

        // Add owner as a member with owner role
        ProjectMember::create([
            'project_id' => $project->id,
            'user_id'    => $request->user()->id,
            'role'       => 'owner',
        ]);

        return response()->json($project->load('owner', 'members.user'), 201);
    }

    // GET /api/projects/{project} — get single project with members and tickets
    public function show(Request $request, Project $project): JsonResponse
    {
        $this->authorizeMember($project, $request);

        $project->load(['owner', 'members.user', 'tickets.assignee', 'tickets.creator', 'tickets.comments.user']);
        $project->is_owner = $project->owner_id === $request->user()->id;

        return response()->json($project);
    }

    // PUT /api/projects/{project} — update project
    public function update(Request $request, Project $project): JsonResponse
    {
        $this->authorizeOwner($project, $request);

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $project->update($validated);

        return response()->json($project);
    }

    // DELETE /api/projects/{project}
    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->authorizeOwner($project, $request);
        $project->delete();
        return response()->json(['message' => 'Project deleted']);
    }

    // POST /api/projects/{project}/invite — invite a member by email
    public function invite(Request $request, Project $project): JsonResponse
    {
        $this->authorizeOwner($project, $request);

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($project->isMember($user->id)) {
            return response()->json(['message' => 'User is already a member.'], 422);
        }

        ProjectMember::create([
            'project_id' => $project->id,
            'user_id'    => $user->id,
            'role'       => 'member',
        ]);

        return response()->json(['message' => 'Member invited successfully.', 'user' => $user]);
    }

    // DELETE /api/projects/{project}/members/{user} — remove a member
    public function removeMember(Request $request, Project $project, User $user): JsonResponse
    {
        $this->authorizeOwner($project, $request);

        if ($user->id === $project->owner_id) {
            return response()->json(['message' => 'Cannot remove the owner.'], 422);
        }

        ProjectMember::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json(['message' => 'Member removed.']);
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