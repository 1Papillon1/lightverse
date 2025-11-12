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
            'username'              => 'required|string|max:255',
            'email'                 => 'required|string|email|max:255|unique:users',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email'    => $request->email,
            'password' => bcrypt($request->password),
        ]);

        Auth::login($user);

        $this->logEvent($request, 'auth.register', $user);

        // Inertia redirect s flash porukom
        return redirect()->route('dashboard')
                         ->with('success', 'Registration successful!');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (! Auth::attempt($credentials)) {
            return back()->withErrors([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $request->session()->regenerate();

        $this->logEvent($request, 'auth.login', $request->user());

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
