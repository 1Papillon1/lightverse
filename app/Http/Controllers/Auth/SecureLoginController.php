<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\LoginVerificationMail;
use App\Models\LoginVerification;
use App\Models\TrustedDevice;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class SecureLoginController extends Controller
{
    // login endpoint
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'device_fingerprint' => 'nullable|string',
            'device_name' => 'nullable|string',
        ]);

        // throttle login attempts with built-in middleware in routes (see routes section)
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials)) {
            \Illuminate\Support\Facades\Log::warning('SECURE LOGIN FAILED - INVALID CREDENTIALS', [
                'email' => $request->email,
                'ip' => $request->ip(),
            ]);
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        $user = Auth::user();

        \Illuminate\Support\Facades\Log::info('SECURE LOGIN - CREDENTIALS VALID', [
            'user_id' => $user->id,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'ip' => $request->ip(),
        ]);

        if (! $user->email_verified_at) {
            \Illuminate\Support\Facades\Log::warning('SECURE LOGIN BLOCKED - EMAIL NOT VERIFIED', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
            ]);

            Auth::logout();

            return response()->json([
                'status' => 'email_not_verified',
                'message' => 'Please verify your email before logging in.',
            ], 403);
        }

        $deviceFingerprint = $request->input('device_fingerprint');
        $ip = $request->ip();
        $userAgent = $request->userAgent();
        $deviceName = $request->input('device_name') ?? $this->extractDeviceName($userAgent);

        // check if trusted device exists for this user
        $trusted = null;
        if ($deviceFingerprint) {
            $trusted = TrustedDevice::where('user_id', $user->id)
                ->where('device_fingerprint', $deviceFingerprint)
                ->first();
        }

        // Optionally check IP/geolocation difference:
        $isNewDevice = ! $trusted;

        if ($isNewDevice) {
            // create verification
            $code = $this->generateCode();
            $expiresAt = Carbon::now()->addMinutes(10);

            $lv = LoginVerification::create([
                'user_id' => $user->id,
                'code' => $code,
                'device_fingerprint' => $deviceFingerprint,
                'ip' => $ip,
                'expires_at' => $expiresAt,
            ]);

            // send email (queued in production)
            Mail::to($user->email)->send(new LoginVerificationMail($code, $deviceName, $ip));

            // log the user out for now (we require verification before session is considered trusted)
            Auth::logout();

            return response()->json([
                'status' => 'verification_required',
                'message' => 'Verification code sent to email.',
                'verification_id' => $lv->id,
            ], 202);
        }

        // trusted device: update last_seen and continue with login (create session)
        $trusted->update([
            'last_seen_at' => Carbon::now(),
            'ip' => $ip,
            'user_agent' => $userAgent,
            'device_name' => $deviceName,
        ]);

        // issue session / token for Inertia normal login
        // if you use sanctum/api tokens, generate token here
        $request->session()->regenerate();

        return response()->json([
            'status' => 'ok',
            'message' => 'Logged in',
        ]);
    }

    // verify code endpoint
    public function verifyCode(Request $request)
    {
        $request->validate([
            'verification_id' => 'required|integer|exists:login_verifications,id',
            'code' => 'required|string',
            'remember_device' => 'sometimes|boolean',
            'device_name' => 'sometimes|string',
        ]);

        $lv = LoginVerification::find($request->input('verification_id'));

        if (! $lv || $lv->used || $lv->isExpired()) {
            return response()->json(['status' => 'invalid_or_expired'], 400);
        }

        if (! hash_equals($lv->code, $request->input('code'))) {
            return response()->json(['status' => 'wrong_code'], 400);
        }

        // mark used
        $lv->update(['used' => true]);

        $user = $lv->user;

        // create trusted device if requested
        $deviceFingerprint = $lv->device_fingerprint;
        $ip = $lv->ip;
        $ua = $request->userAgent();
        $deviceName = $request->input('device_name') ?? $this->extractDeviceName($ua);

        if ($request->boolean('remember_device')) {
            TrustedDevice::create([
                'user_id' => $user->id,
                'device_fingerprint' => $deviceFingerprint,
                'device_name' => $deviceName,
                'ip' => $ip,
                'country' => null,
                'user_agent' => $ua,
                'last_seen_at' => Carbon::now(),
            ]);
        }

        // login the user (create session)
        Auth::loginUsingId($user->id);
        request()->session()->regenerate();

        return response()->json(['status' => 'ok', 'message' => 'Verified and logged in']);
    }

    protected function generateCode()
    {
        // 6-digit numeric code
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    protected function extractDeviceName($ua)
    {
        // very lightweight ua parse; for richer parsing use a library like browscap or ua-parser
        if (stripos($ua, 'mobile') !== false) {
            return 'Mobile';
        }
        if (stripos($ua, 'chrome') !== false) {
            return 'Chrome';
        }
        if (stripos($ua, 'firefox') !== false) {
            return 'Firefox';
        }

        return 'Browser';
    }
}
