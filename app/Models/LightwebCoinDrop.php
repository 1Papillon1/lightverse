<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;


class LightwebCoinDrop extends Model
{
       protected $fillable = [
        'user_id',
        'amount',
        'reason',
        'x', 'y', 'z',
        'rot_x', 'rot_y', 'rot_z',   // ✅ NEW
        'spawn_location',
        'claimed',
        'claimed_at',
        'expires_at',
    ];

    protected $casts = [
        'claimed' => 'boolean',
        'claimed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function isExpired()
    {
        return $this->expires_at && Carbon::now()->greaterThan($this->expires_at);
    }
}
