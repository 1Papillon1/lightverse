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
        Log::info('REGISTER ATTEMPT', [
            'username' => $request->username,
            'email' => $request->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
        ]);

        try {
            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'password' => bcrypt($request->password),
            ]);

            Log::info('USER CREATED', [
                'user_id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'implements_must_verify' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            ]);

            // Store device fingerprint in cookie for verification later
            $deviceFingerprint = $request->input('device_fingerprint');
            if ($deviceFingerprint) {
                cookie()->queue('device_fingerprint', $deviceFingerprint, 60 * 24 * 30); // 30 days
                Log::info('DEVICE FINGERPRINT STORED IN COOKIE ON REGISTRATION', [
                    'user_id' => $user->id,
                    'fingerprint' => $deviceFingerprint,
                ]);
            }

            // Dispatch Registered event - ovo automatski šalje verification email
            Log::info('DISPATCHING REGISTERED EVENT', ['user_id' => $user->id]);
            event(new Registered($user));
            Log::info('REGISTERED EVENT DISPATCHED', ['user_id' => $user->id]);

            Auth::login($user);
            Log::info('USER LOGGED IN', ['user_id' => $user->id]);

            $this->logEvent($request, 'auth.register', $user);

            Log::info('REDIRECTING TO VERIFICATION NOTICE', ['user_id' => $user->id]);
            return redirect()->route('verification.notice')
                ->with('success', 'Registration successful! Please verify your email.');
        } catch (\Exception $e) {
            Log::error('REGISTRATION FAILED', [
                'email' => $request->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

   public function login(Request $request): RedirectResponse
    {
        Log::info('LOGIN ATTEMPT', [
            'email' => $request->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $remember = $request->boolean('remember');

        if (! Auth::attempt($credentials, $remember)) {
            Log::warning('LOGIN FAILED - INVALID CREDENTIALS', [
                'email' => $request->email,
                'ip' => $request->ip(),
            ]);
            return back()->withErrors([
                'email' => 'These credentials do not match our records.',
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
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'is_verified' => $user->hasVerifiedEmail(),
            'ip' => $request->ip(),
        ]);

       

        // Block if not verified
        if (! $user->hasVerifiedEmail()) {
            Log::warning('LOGIN BLOCKED - EMAIL NOT VERIFIED', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
            ]);

            return redirect()->route('verification.notice')
                ->with('message', 'Please verify your email address to continue.');
        }

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
                'email' => $user->email,
            ],
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
