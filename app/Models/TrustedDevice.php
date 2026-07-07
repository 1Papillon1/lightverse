<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrustedDevice extends Model
{
    protected $fillable = [
        'user_id',
        'device_fingerprint',
        'device_name',
        'ip',
        'country',
        'user_agent',
        'last_seen_at',
    ];

    protected $dates = [
        'last_seen_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
