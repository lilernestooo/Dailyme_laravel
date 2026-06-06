<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('tasks')->group(function () {
        Route::get('/',              [TaskController::class, 'index']);
        Route::post('/',             [TaskController::class, 'store']);
        Route::put('/{task}',        [TaskController::class, 'update']);
        Route::patch('/{task}/move', [TaskController::class, 'move']);
        Route::delete('/{task}',     [TaskController::class, 'destroy']);
    });
});