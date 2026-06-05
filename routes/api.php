<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;

Route::prefix('tasks')->group(function () {
    Route::get('/',              [TaskController::class, 'index']);
    Route::post('/',             [TaskController::class, 'store']);
    Route::put('/{task}',        [TaskController::class, 'update']);
    Route::patch('/{task}/move', [TaskController::class, 'move']);
    Route::delete('/{task}',     [TaskController::class, 'destroy']);
});