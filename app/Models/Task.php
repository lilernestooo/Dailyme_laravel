<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'order',
        'priority',
        'completed_at',       // ← new
    ];

    protected $casts = [
        'completed_at' => 'datetime',  // ← returns Carbon, serializes to ISO string
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}