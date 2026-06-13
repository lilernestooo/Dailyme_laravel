<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // ── Middleware guard ───────────────────────────────────────────────────
    private function requireAdmin(Request $request): ?JsonResponse
    {
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return null;
    }

    // ── GET /api/admin/stats ───────────────────────────────────────────────
    public function stats(Request $request): JsonResponse
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $totalUsers    = User::count();
        $totalProjects = DB::table('projects')->count();
        $totalTasks    = DB::table('tasks')->count();
        $totalTickets  = DB::table('tickets')->count();
        $adminCount    = User::where('is_admin', true)->count();

        // Ticket status breakdown
        $ticketsByStatus = DB::table('tickets')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->keyBy('status')
            ->map(fn($r) => $r->count);

        // Ticket priority breakdown
        $ticketsByPriority = DB::table('tickets')
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->get()
            ->keyBy('priority')
            ->map(fn($r) => $r->count);

        // Task status breakdown
        $tasksByStatus = DB::table('tasks')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->keyBy('status')
            ->map(fn($r) => $r->count);

        // Member roles breakdown
        $membersByRole = DB::table('project_members')
            ->select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->get()
            ->keyBy('role')
            ->map(fn($r) => $r->count);

        // New users per day (last 7 days)
        $newUsersChart = DB::table('users')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'total_users'         => $totalUsers,
            'total_projects'      => $totalProjects,
            'total_tasks'         => $totalTasks,
            'total_tickets'       => $totalTickets,
            'admin_count'         => $adminCount,
            'tickets_by_status'   => $ticketsByStatus,
            'tickets_by_priority' => $ticketsByPriority,
            'tasks_by_status'     => $tasksByStatus,
            'members_by_role'     => $membersByRole,
            'new_users_chart'     => $newUsersChart,
        ]);
    }

    // ── GET /api/admin/users ───────────────────────────────────────────────
    public function users(Request $request): JsonResponse
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $users = User::select('id', 'name', 'email', 'is_admin', 'created_at')
            ->withCount([
                'tasks',
                'ownedProjects as projects_owned',
            ])
            ->addSelect([
                'projects_member' => DB::table('project_members')
                    ->selectRaw('count(*)')
                    ->whereColumn('user_id', 'users.id'),
            ])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($users);
    }

    // ── PATCH /api/admin/users/{user}/toggle-admin ─────────────────────────
    public function toggleAdmin(Request $request, User $user): JsonResponse
    {
        if ($err = $this->requireAdmin($request)) return $err;

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot change your own admin status.'], 422);
        }

        $user->update(['is_admin' => !$user->is_admin]);

        return response()->json(['user' => $user]);
    }

    // ── DELETE /api/admin/users/{user} ─────────────────────────────────────
    public function deleteUser(Request $request, User $user): JsonResponse
    {
        if ($err = $this->requireAdmin($request)) return $err;

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete yourself.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}