<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    public function index(): JsonResponse
    {
        $tasks = Task::orderBy('order')->get()->groupBy('status');

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

        $maxOrder = Task::where('status', $validated['status'] ?? 'todo')->max('order') ?? -1;

        $task = Task::create([
            ...$validated,
            'status' => $validated['status'] ?? 'todo',
            'order'  => $maxOrder + 1,
        ]);

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'in:low,medium,high',
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    public function move(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:todo,in_progress,done',
            'order'  => 'required|integer|min:0',
        ]);

        $oldStatus = $task->status;
        $newStatus = $validated['status'];
        $newOrder  = $validated['order'];

        if ($oldStatus !== $newStatus) {
            Task::where('status', $newStatus)
                ->where('order', '>=', $newOrder)
                ->increment('order');

            Task::where('status', $oldStatus)
                ->where('order', '>', $task->order)
                ->decrement('order');
        }

        $task->update(['status' => $newStatus, 'order' => $newOrder]);

        return response()->json($task);
    }

    public function destroy(Task $task): JsonResponse
    {
        Task::where('status', $task->status)
            ->where('order', '>', $task->order)
            ->decrement('order');

        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }
}