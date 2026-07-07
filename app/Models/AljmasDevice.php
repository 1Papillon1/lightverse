<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AljmasDevice extends Model
{
    protected $fillable = ['device_uuid', 'nickname'];

   public function locations(): BelongsToMany
    {
        return $this->belongsToMany(
            AljmasLocation::class,
            'aljmas_device_locations',
            'device_id',
            'location_id'
        )
        ->withPivot('unlocked_at')
        ->withTimestamps();
    }

    public function unlockedLocationIds(): array
    {
        return $this->locations()->pluck('aljmas_locations.id')->toArray();
    }
}