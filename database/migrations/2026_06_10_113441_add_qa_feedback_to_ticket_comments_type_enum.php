<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE ticket_comments MODIFY COLUMN type ENUM('comment', 'approve', 'reject', 'qa_feedback') NOT NULL DEFAULT 'comment'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE ticket_comments MODIFY COLUMN type ENUM('comment', 'approve', 'reject') NOT NULL DEFAULT 'comment'");
    }
};