<?php
namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Mark single notification as read
     */
    public function markAsRead(Notification $notification)
    {
        // Ensure user owns this notification
        if ($notification->user_id !== auth()->id()) {
            abort(403);
        }

        $notification->markAsRead();

        return back();
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        NotificationService::markAllAsRead(auth()->user());

        return back();
    }

    /**
     * Delete notification
     */
    public function destroy(Notification $notification)
    {
        // Ensure user owns this notification
        if ($notification->user_id !== auth()->id()) {
            abort(403);
        }

        $notification->delete();

        return back();
    }

    /**
     * Get all notifications (for modal)
     */
    public function index()
    {
        $notifications = auth()->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('Galaxy/Identity/LightSignature/Notifications', [
            'notifications' => $notifications,
        ]);
    }
}
