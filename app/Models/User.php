<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\LightTransaction;
use App\Services\LightService;


class User extends Authenticatable
{
        use HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'email',
        'password',
        'core_light',
        'stable_light',
        'active_light',
        'total_light',
        'bio',           // ✅ add
        'twitter_url',
        'reddit_url',
        'cosmic_color',  // ✅ add
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
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

    public function achievements()
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withTimestamps()
            ->withPivot('unlocked_at');
    }

      protected static function booted()
    {
        // ✅ GENESIS SPARK: Award 1 Core Light on registration
        static::created(function (User $user) {
            app(LightService::class)->award(
                user: $user,
                type: 'core',
                amount: 1,
                source: 'genesis',
                expiresAt: null
            );
        });
    }

    public function lightTransactions()
    {
        return $this->hasMany(LightTransaction::class);
    }

    public function recalculateLight()
    {
        $this->total_light =
            $this->core_light +
            $this->stable_light +
            $this->active_light;

        $this->save();
    }

      public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotificationsCount(): int
    {
        return $this->notifications()->unread()->count();
    }
}