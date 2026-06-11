<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE tickets MODIFY COLUMN status ENUM('todo','in_progress','review','qa_approved','done','archived') NOT NULL DEFAULT 'todo'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE tickets MODIFY COLUMN status ENUM('todo','in_progress','review','done','archived') NOT NULL DEFAULT 'todo'");
    }
};