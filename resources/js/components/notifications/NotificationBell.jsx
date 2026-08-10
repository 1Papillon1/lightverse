import { useState, useRef, useEffect, useContext } from 'react';
import { router, usePage } from '@inertiajs/react';
import { observer } from 'mobx-react-lite';
import { RootStoreContext } from '@/stores/RootStore';
import NotificationRow from '@/components/notifications/NotificationRow';

// ─── Main component ───────────────────────────────────────────────────────────


const NotificationBell = observer(() => {
  const { notificationsStore } = useContext(RootStoreContext); // ← no 's'

  const localNotifs = notificationsStore.notifications;
  const localCount  = notificationsStore.unreadCount;

  const [open, setOpen] = useState(false); // ← add this
  const bellRef  = useRef(null);
  const panelRef = useRef(null);

  // Outside click handler
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


  const markRead = (id) => {
    router.post(`/notifications/${id}/read`, {}, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => notificationsStore.markRead(id),
    });
  };

  const markAllRead = () => {
    router.post('/notifications/mark-all-read', {}, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => notificationsStore.markAllRead(),
    });
  };

  const deleteNotif = (id) => {
    router.delete(`/notifications/${id}`, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => notificationsStore.remove(id),
    });
  };

  // ─── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="notif-bell">
      {/* Bell */}
      <button
        ref={bellRef}  // ✅ make sure this is here
        className={`notif-bell__btn ${open ? 'notif-bell__btn--open' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        <span className="notif-bell__icon">🔔</span>
        {localCount > 0 && (
          <span className="notif-bell__badge">{localCount > 9 ? '9+' : localCount}</span>
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
                 router.visit('/galaxy/identity/light-signature/notifications');
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
});

export default NotificationBell;