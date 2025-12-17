<?php

namespace App\Policies;

use App\Models\User;
use App\Models\LightwebCoinDrop;

class LightwebCoinDropPolicy
{
    public function claim(User $user, LightwebCoinDrop $drop)
    {
        return $user->id === $drop->user_id;
    }
}
