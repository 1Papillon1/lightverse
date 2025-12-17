<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\User;
use App\Models\LightwebCoinDrop;
use App\Observers\UserObserver;
use Illuminate\Support\Facades\Gate;
use App\Policies\LightwebCoinDropPolicy;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        User::observe(UserObserver::class);

        Gate::policy(LightwebCoinDrop::class, LightwebCoinDropPolicy::class);
    }
}
