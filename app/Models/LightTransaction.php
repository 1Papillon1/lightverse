<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LightTransaction extends Model
{
    protected $fillable = [
    'user_id',
    'type',
    'amount',
    'source',
    'expires_at',
    'reconciled_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'reconciled_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
