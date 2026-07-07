<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Generator extends Model
{
    protected $fillable = [
        'user_id',
        'state',
        'current_stage',
        'stage_started_at',
        'completed_stages',
    ];

    protected $casts = [
        'stage_started_at' => 'datetime',
        'completed_stages' => 'array',
        'current_stage'    => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Convenience: check if a specific stage key is done
    public function hasCompleted(string $stageKey): bool
    {
        return in_array($stageKey, $this->completed_stages ?? [], true);
    }
}