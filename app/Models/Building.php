<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;


class Building extends Model
{
    protected $fillable = [
        'user_id', 'planet_id', 'title', 'voxel_data',
        'block_count', 'light_received', 'comment_count',
        'rating_average', 'rating_count', 'published_at',
    ];

    protected $casts = [
        'voxel_data'   => 'array',
        'published_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contributions(): HasMany
    {
        return $this->hasMany(BuildingContribution::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(BuildingComment::class)->where('is_hidden', false);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(BuildingRating::class);
    }

    public function hasContributionFrom(User $user): bool
    {
        return $this->contributions()->where('user_id', $user->id)->exists();
    }
}