<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Create a notification for a user
     */
    public static function create(
        User $user,
        string $type,
        string $title,
        ?string $message = null,
        ?string $actionUrl = null,
        ?array $metadata = null
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'action_url' => $actionUrl,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Notify user about Light earned
     */
    public static function lightEarned(User $user, int $amount, string $source): Notification
    {
        return self::create(
            user: $user,
            type: 'light_earned',
            title: "+{$amount} Light earned",
            message: "You earned {$amount} Light from {$source}",
            metadata: ['light_amount' => $amount, 'source' => $source]
        );
    }

    /**
     * Notify user about achievement unlocked
     */
    public static function achievementUnlocked(User $user, string $achievementName, string $achievementId): Notification
    {
        return self::create(
            user: $user,
            type: 'achievement',
            title: "Achievement unlocked!",
            message: "You've earned: {$achievementName}",
            actionUrl: "/galaxy/identity/achievements",
            metadata: ['achievement_id' => $achievementId]
        );
    }

    /**
     * Notify user about new content
     */
    public static function newContent(User $user, string $title, string $location, string $url): Notification
    {
        return self::create(
            user: $user,
            type: 'new_content',
            title: "New in {$location}",
            message: $title,
            actionUrl: $url
        );
    }

    /**
     * System notification
     */
    public static function system(User $user, string $title, string $message, ?string $actionUrl = null): Notification
    {
        return self::create(
            user: $user,
            type: 'system',
            title: $title,
            message: $message,
            actionUrl: $actionUrl
        );
    }

    /**
     * Mark all notifications as read for user
     */
    public static function markAllAsRead(User $user): int
    {
        return $user->notifications()->unread()->update(['read_at' => now()]);
    }
}