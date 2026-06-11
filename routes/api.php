<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketCommentController;
use App\Http\Controllers\NotificationController;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Daily tasks
    Route::prefix('tasks')->group(function () {
        Route::get('/',              [TaskController::class, 'index']);
        Route::post('/',             [TaskController::class, 'store']);
        Route::put('/{task}',        [TaskController::class, 'update']);
        Route::patch('/{task}/move', [TaskController::class, 'move']);
        Route::delete('/{task}',     [TaskController::class, 'destroy']);
    });

    // Notifications — static routes MUST come before {notification} wildcard
    Route::get('/notifications',                          [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count',             [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/read-all',               [NotificationController::class, 'readAll']);
    Route::delete('/notifications/clear-all',             [NotificationController::class, 'clearAll']);
    Route::patch('/notifications/{notification}/read',    [NotificationController::class, 'read']);
    Route::delete('/notifications/{notification}',        [NotificationController::class, 'destroy']);

    // Projects
    Route::prefix('projects')->group(function () {
        Route::get('/',             [ProjectController::class, 'index']);
        Route::post('/',            [ProjectController::class, 'store']);
        Route::get('/{project}',    [ProjectController::class, 'show']);
        Route::put('/{project}',    [ProjectController::class, 'update']);
        Route::delete('/{project}', [ProjectController::class, 'destroy']);
        Route::post('/{project}/invite',           [ProjectController::class, 'invite']);
        Route::delete('/{project}/members/{user}', [ProjectController::class, 'removeMember']);

        // Tickets
        Route::get('/{project}/tickets',                   [TicketController::class, 'index']);
        Route::post('/{project}/tickets',                  [TicketController::class, 'store']);
        Route::put('/{project}/tickets/{ticket}',          [TicketController::class, 'update']);
        Route::patch('/{project}/tickets/{ticket}/move',   [TicketController::class, 'move']);
        Route::delete('/{project}/tickets/{ticket}',       [TicketController::class, 'destroy']);

        // Comments
        Route::post('/{project}/tickets/{ticket}/comments', [TicketCommentController::class, 'store']);
    });
});