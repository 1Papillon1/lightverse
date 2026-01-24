<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
   public function register(Request $request): RedirectResponse
{
    $request->validate([
        'username' => 'required|string|max:255|unique:users,username',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $user = User::create([
        'username' => $request->username,
        'password' => bcrypt($request->password),
    ]);

    Auth::login($user);

    $this->logEvent($request, 'auth.register', $user);

    return redirect()->intended('/dashboard');
}

   public function login(Request $request): RedirectResponse
    {
        Log::info('LOGIN ATTEMPT', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $credentials = $request->validate([
    'username' => 'required|string',
    'password' => 'required',
]);

        $remember = $request->boolean('remember');

        if (!Auth::attempt([
            'username' => $credentials['username'],
            'password' => $credentials['password'],
        ], $remember)) {
            return back()->withErrors([
                'username' => 'Invalid credentials',
            ]);
        }

        // Regenerate session to prevent fixation (after successful attempt)
        $request->session()->regenerate();

        // Get fresh user model (loads any DB changes e.g. email_verified_at)
        $user = $request->user();
        $user->refresh();

        // get user roles
        $user->load('roles');

        Log::info('LOGIN SUCCESSFUL - POST-REFRESH', [
            'user_id' => $user->id,
            'username' => $user->username,
            'ip' => $request->ip(),
        ]);

       


        // Safe: attempt first-login spawn/unlock but do not let it break login
        try {
            $achievements = app(\App\Services\AchievementsService::class);
            $coins = app(\App\Services\LightwebCoinService::class);

            if (! $achievements->has($user, 'first_login_spawn')) {
                $coins->spawnFirstLoginDrops($user);
                $achievements->unlock($user, 'first_login_spawn');
                Log::info('INITIAL LIGHTWEB COINS SPAWNED (login flow)', ['user_id' => $user->id]);
            }
        } catch (\Throwable $e) {
            // Don't block the login flow if reward spawn fails
            Log::error('FAILED TO SPAWN INITIAL COINS DURING LOGIN', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        $this->logEvent($request, 'auth.login', $user);

        Log::info('LOGIN COMPLETE - REDIRECTING TO DASHBOARD', ['user_id' => $user->id]);

        return redirect()->intended('/dashboard');
    }


    public function logout(Request $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($user !== null) {
            $this->logEvent($request, 'auth.logout', $user);
        }

        return redirect()->route('login')
            ->with('success', 'You have been logged out.');
    }

    private function logEvent(Request $request, string $event, ?User $user): void
    {
        if ($user === null) {
            return;
        }

        Log::info($event, [
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => null,
            ],
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
