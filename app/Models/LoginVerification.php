<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginVerification extends Model
{
    protected $fillable = [
        'user_id',
        'code',
        'device_fingerprint',
        'ip',
        'used',
        'expires_at',
    ];

    protected $dates = [
        'expires_at',
    ];

    public function isExpired()
    {
        return $this->expires_at->isPast();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
