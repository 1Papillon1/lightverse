<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TaskService;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;


class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'username' => [
                'sometimes',
                'string',
                'min:3',
                'max:30',
                'regex:/^[a-zA-Z0-9_]+$/',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'bio' => [
                'sometimes',
                'nullable',
                'string',
                'max:120',
            ],
            'cosmic_color' => [
                'sometimes',
                'string',
                'regex:/^#[0-9a-fA-F]{6}$/',
            ],
            'twitter_url' => [
                'sometimes',
                'nullable',
                'url',
                'max:255',
            ],
            'reddit_url' => [
                'sometimes',
                'nullable',
                'url',
                'max:255',
            ],
        ]);

        $user->update($validated);

         // ✅ Check if profile is now complete
        $user = $request->user()->fresh();
        if ($user->username && $user->bio && $user->cosmic_color) {
            app(TaskService::class)
                ->progress($user, 'create_profile');
        }

        Log::info('PROFILE UPDATED', [
            'user_id' => $user->id,
            'fields'  => array_keys($validated),
        ]);

        return back()->with('success', 'Profile updated.');
    }
}