<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AljmasLocation extends Model
{
    protected $fillable = [
        'order', 'name', 'dialect_name', 'lat', 'lng',
        'radius_meters', 'dialect_story', 'historical_note',
        'clue_text', 'audio_url', 'image_url', 'is_final',
    ];

    protected $casts = [
        'lat' => 'float',
        'lng' => 'float',
        'is_final' => 'boolean',
    ];

    public function devices(): BelongsToMany
    {
        return $this->belongsToMany(
            AljmasDevice::class,
            'aljmas_device_locations',
            'location_id',
            'device_id'
        )
        ->withPivot('unlocked_at');
    }
}