<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tasks = Task::where('user_id', $request->user()->id)
            ->orderBy('order')
            ->get()
            ->groupBy('status');

        return response()->json([
            'todo'        => $tasks->get('todo', collect()),
            'in_progress' => $tasks->get('in_progress', collect()),
            'done'        => $tasks->get('done', collect()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'in:todo,in_progress,done',
            'priority'    => 'in:low,medium,high',
        ]);

        $status   = $validated['status'] ?? 'todo';
        $maxOrder = Task::where('user_id', $request->user()->id)
            ->where('status', $status)
            ->max('order') ?? -1;

        $task = Task::create([
            ...$validated,
            'user_id'      => $request->user()->id,
            'status'       => $status,
            'order'        => $maxOrder + 1,
            'completed_at' => $status === 'done' ? Carbon::now() : null, // ← new
        ]);

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($task, $request);

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'in:low,medium,high',
            'status'      => 'sometimes|in:todo,in_progress,done', // ← allow status change via modal
        ]);

        // Stamp or clear completed_at when status changes via the Edit modal
        if (isset($validated['status'])) {
            $newStatus = $validated['status'];
            if ($newStatus === 'done' && $task->status !== 'done') {
                $validated['completed_at'] = Carbon::now();   // just became done
            } elseif ($newStatus !== 'done' && $task->status === 'done') {
                $validated['completed_at'] = null;            // moved away from done
            }
        }

        $task->update($validated);

        return response()->json($task);
    }

    public function move(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($task, $request);

        $validated = $request->validate([
            'status' => 'required|in:todo,in_progress,done',
            'order'  => 'required|integer|min:0',
        ]);

        $userId    = $request->user()->id;
        $oldStatus = $task->status;
        $newStatus = $validated['status'];
        $newOrder  = $validated['order'];

        if ($oldStatus !== $newStatus) {
            Task::where('user_id', $userId)->where('status', $newStatus)->where('order', '>=', $newOrder)->increment('order');
            Task::where('user_id', $userId)->where('status', $oldStatus)->where('order', '>', $task->order)->decrement('order');
        } else {
            if ($newOrder < $task->order) {
                Task::where('user_id', $userId)->where('status', $newStatus)->whereBetween('order', [$newOrder, $task->order - 1])->increment('order');
            } else {
                Task::where('user_id', $userId)->where('status', $newStatus)->whereBetween('order', [$task->order + 1, $newOrder])->decrement('order');
            }
        }

        // Stamp or clear completed_at on drag-drop
        $completedAt = $task->completed_at;
        if ($newStatus === 'done' && $oldStatus !== 'done') {
            $completedAt = Carbon::now();   // ← just dragged into Done
        } elseif ($newStatus !== 'done' && $oldStatus === 'done') {
            $completedAt = null;            // ← dragged out of Done
        }

        $task->update([
            'status'       => $newStatus,
            'order'        => $newOrder,
            'completed_at' => $completedAt,  // ← new
        ]);

        return response()->json($task);
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($task, $request);

        Task::where('user_id', $request->user()->id)
            ->where('status', $task->status)
            ->where('order', '>', $task->order)
            ->decrement('order');

        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }

    private function authorizeTask(Task $task, Request $request): void
    {
        if ($task->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }
    }
}