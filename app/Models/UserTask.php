<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserTask extends Model
{
      protected $fillable = [
        'user_id', 'task_id', 'progress',
        'completed', 'completed_at', 'last_reset_at',
    ];

    protected $casts = [
        'completed'     => 'boolean',
        'completed_at'  => 'datetime',
        'last_reset_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
