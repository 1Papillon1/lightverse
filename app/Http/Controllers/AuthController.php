<?php

namespace App\Http\Controllers;

use App\Models\User;
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

        // ✅ Genesis Spark is awarded automatically via User::booted()
        // No need to do anything here - just redirect

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

        $request->session()->regenerate();
        $user = $request->user();
        $user->refresh();
        $user->load('roles');

        Log::info('LOGIN SUCCESSFUL', [
            'user_id' => $user->id,
            'username' => $user->username,
            'ip' => $request->ip(),
        ]);

        // ✅ AWARD FIRST LOGIN ACHIEVEMENT (Active Light)
        try {
            $achievements = app(\App\Services\AchievementsService::class);

            if (!$achievements->has($user, 'first_login')) {
                $achievements->unlock($user, 'first_login');
                Log::info('FIRST LOGIN ACHIEVEMENT UNLOCKED', ['user_id' => $user->id]);
            }
        } catch (\Throwable $e) {
            Log::error('FAILED TO UNLOCK FIRST LOGIN ACHIEVEMENT', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        $this->logEvent($request, 'auth.login', $user);

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
            ],
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}