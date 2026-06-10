<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'owner_id', 'qa_required'];  // ← added qa_required

    protected $casts = [
        'qa_required' => 'boolean',  // ← added
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function isMember(int $userId): bool
    {
        return $this->members()->where('user_id', $userId)->exists();
    }

    public function isOwner(int $userId): bool
    {
        return $this->owner_id === $userId;
    }

    // ← added
    public function isQA(int $userId): bool
    {
        return $this->members()->where('user_id', $userId)->where('role', 'qa')->exists();
    }
}