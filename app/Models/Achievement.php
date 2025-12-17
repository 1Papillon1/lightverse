<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
       protected $fillable = [
        'code', 'name', 'category', 'data'
    ];

    protected $casts = [
        'data' => 'array'
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_achievements')
            ->withTimestamps()
            ->withPivot('unlocked_at');
    }
}
