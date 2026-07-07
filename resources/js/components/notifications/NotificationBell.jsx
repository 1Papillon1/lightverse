import { useState, useRef, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import NotificationRow from '@/components/notifications/NotificationRow';

// ─── Main component ───────────────────────────────────────────────────────────

const NotificationBell = () => {
  const {
    recentNotifications = [],
    unreadNotificationsCount = 0,
  } = usePage().props;

  const [open, setOpen] = useState(false);
  const [localNotifs, setLocalNotifs] = useState(recentNotifications);
  const [localCount, setLocalCount] = useState(unreadNotificationsCount);

  const panelRef = useRef(null);
  const bellRef = useRef(null);

  // Sync props
  useEffect(() => {
    setLocalNotifs(recentNotifications);
    setLocalCount(unreadNotificationsCount);
  }, [recentNotifications, unreadNotificationsCount]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const markRead = (id) => {
    router.post(`/notifications/${id}/read`, {}, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setLocalNotifs((prev) =>
          prev.map((n) =>
            n.id === id
              ? { ...n, read_at: new Date().toISOString() }
              : n
          )
        );
        setLocalCount((c) => Math.max(0, c - 1));
      },
    });
  };

  const markAllRead = () => {
    router.post('/notifications/read-all', {}, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setLocalNotifs((prev) =>
          prev.map((n) => ({
            ...n,
            read_at: n.read_at ?? new Date().toISOString(),
          }))
        );
        setLocalCount(0);
      },
    });
  };

  const deleteNotif = (id) => {
    router.delete(`/notifications/${id}`, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        const removed = localNotifs.find((n) => n.id === id);

        setLocalNotifs((prev) => prev.filter((n) => n.id !== id));

        if (removed && !removed.read_at) {
          setLocalCount((c) => Math.max(0, c - 1));
        }
      },
    });
  };

  // ─── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="notif-bell">
      {/* Bell */}
      <button
        ref={bellRef}
        className={`notif-bell__btn ${
          open ? 'notif-bell__btn--open' : ''
        }`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <span className="notif-bell__icon">🔔</span>

        {localCount > 0 && (
          <span className="notif-bell__badge">
            {localCount > 9 ? '9+' : localCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div ref={panelRef} className="notif-bell__panel">
          <div className="notif-bell__header">
            <span className="notif-bell__header-title">
              Notifications
            </span>

            {localCount > 0 && (
              <button
                className="notif-bell__mark-all"
                onClick={markAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-bell__list">
            {localNotifs.length === 0 ? (
              <div className="notif-bell__empty">
                <span className="notif-bell__empty-icon">✦</span>
                <p>No notifications yet.</p>
              </div>
            ) : (
              localNotifs.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onMarkRead={markRead}
                  onDelete={deleteNotif}
                />
              ))
            )}
          </div>

          {localNotifs.length > 0 && (
            <div className="notif-bell__footer">
              <button
                className="notif-bell__view-all"
                onClick={() => {
                  setOpen(false);
                  router.visit('/notifications');
                }}
              >
                View all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;