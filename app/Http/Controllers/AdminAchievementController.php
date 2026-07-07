<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminAchievementController extends Controller
{
     /**
     * Store a new achievement.
     * Admin-only (guarded by middleware).
     */
    public function store(Request $request)
    {
        // Extra safety (middleware already handles this)
        if (! $request->user() || ! $request->user()->isAdmin()) {
            abort(403, 'Admin access only');
        }

        try {
            $validated = $request->validate([
                'code' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:achievements,code',
                ],
                'data' => [
                    'nullable',
                    'array',
                ],
            ]);

            $achievement = Achievement::create([
                'code' => $validated['code'],
                'data' => $validated['data'] ?? [],
            ]);

            Log::info('ADMIN ACHIEVEMENT CREATED', [
                'admin_id' => $request->user()->id,
                'achievement_id' => $achievement->id,
                'code' => $achievement->code,
            ]);

            return back()->with('success', 'Achievement created successfully');

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error('FAILED TO CREATE ACHIEVEMENT', [
                'admin_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to create achievement',
            ]);
        }
    }

    /**
     * (Optional) List all achievements
     * Useful for admin UI later.
     */
    public function index()
    {
        abort_unless(auth()->user()?->isAdmin(), 403);

        return Achievement::orderBy('created_at', 'desc')->get();
    }

    /**
     * (Optional) Delete achievement
     */
    public function destroy(Achievement $achievement)
    {
        abort_unless(auth()->user()?->isAdmin(), 403);

        $achievement->delete();

        Log::warning('ADMIN ACHIEVEMENT DELETED', [
            'admin_id' => auth()->id(),
            'achievement_id' => $achievement->id,
            'code' => $achievement->code,
        ]);

        return back()->with('success', 'Achievement deleted');
    }
}
