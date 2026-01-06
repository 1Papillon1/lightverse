<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;


class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'initial_coins_spawned',   // ✅ first-login reward lock
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'      => 'datetime',
            'password'              => 'hashed',
            'initial_coins_spawned' => 'boolean',
        ];
    }

    /* -----------------------------------------------------------------
     |  RELATIONSHIPS
     | -----------------------------------------------------------------
     */

     public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function isAdmin(): bool
    {
        return $this->roles()->where('name', 'admin')->exists();
    }

    // ✅ Wallet
    public function balance()
    {
        return $this->hasOne(UserBalance::class);
    }

    // ✅ All coin drops ever
    public function coinDrops()
    {
        return $this->hasMany(LightwebCoinDrop::class);
    }

    // ✅ Only available coins
    public function activeCoinDrops()
    {
        return $this->hasMany(LightwebCoinDrop::class)
            ->where('claimed', false)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }

    public function achievements()
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withTimestamps()
            ->withPivot('unlocked_at');
    }
}