<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
     protected $fillable = [
        'code', 'title', 'description', 'icon',
        'type', 'light_type', 'light_reward',
        'required_count', 'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function userTasks()
    {
        return $this->hasMany(UserTask::class);
    }
}
