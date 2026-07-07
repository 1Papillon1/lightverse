import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
 
const TYPE_CONFIG = {
  light_earned: { icon: '✦', label: 'Light earned',  color: '#c9a0ff' },
  achievement:  { icon: '💠', label: 'Achievement',   color: '#ffcc44' },
  new_content:  { icon: '◈',  label: 'New content',   color: '#00ccaa' },
  system:       { icon: '⚙',  label: 'System',        color: '#888'    },
};
 
const timeAgo = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
};
 
const NotificationsIndex = ({ notifications: initial = [] }) => {
  const [items, setItems] = useState(initial);
 
  const markRead = (id) => {
    router.post(`/notifications/${id}/read`, {}, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => setItems(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      ),
    });
  };
 
  const markAllRead = () => {
    router.post('/notifications/read-all', {}, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => setItems(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      ),
    });
  };
 
  const deleteItem = (id) => {
    router.delete(`/notifications/${id}`, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => setItems(prev => prev.filter(n => n.id !== id)),
    });
  };
 
  const unreadCount = items.filter(n => !n.read_at).length;
 
  return (
    <>
      <Head><title>Notifications — Lightverse</title></Head>
      <UniverseBackdrop />
 
      <section className="lumina-codex">
        <div className="lumina-codex__projector" />
        <div
          className="lumina-codex__card notif-page__card"
          style={{ transform: 'translate(-50%, -50%)', opacity: 1, pointerEvents: 'auto' }}
        >
          <div className="lumina-codex__core notif-page__core">
 
            <div className="notif-page__header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button className="notif-page__mark-all" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>
 
            {items.length === 0 ? (
              <div className="notif-page__empty">
                <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>✦</span>
                <p className="lumina-codex__note">No notifications yet.</p>
              </div>
            ) : (
              <div className="notif-page__list">
                {items.map(n => {
                  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
                  const isUnread = !n.read_at;
                  return (
                    <div
                      key={n.id}
                      className={`notif-page__row ${isUnread ? 'notif-page__row--unread' : ''} ${n.action_url ? 'notif-page__row--clickable' : ''}`}
                      onClick={n.action_url ? () => { if (isUnread) markRead(n.id); router.visit(n.action_url); } : undefined}
                    >
                      <div className="notif-page__row-icon" style={{ color: cfg.color }}>
                        {cfg.icon}
                      </div>
 
                      <div className="notif-page__row-body">
                        <div className="notif-page__row-title">{n.title}</div>
                        {n.message && (
                          <div className="notif-page__row-msg">{n.message}</div>
                        )}
                        <div className="notif-page__row-meta">
                          <span className="notif-page__row-type">{cfg.label}</span>
                          <span className="notif-page__row-time">{timeAgo(n.created_at)}</span>
                        </div>
                      </div>
 
                      <div className="notif-page__row-actions" onClick={e => e.stopPropagation()}>
                        {isUnread && (
                          <button className="notif-page__btn-read" onClick={() => markRead(n.id)} title="Mark as read">
                            ✓
                          </button>
                        )}
                        <button className="notif-page__btn-delete" onClick={() => deleteItem(n.id)} title="Delete">
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
 
          </div>
        </div>
      </section>
    </>
  );
};
 
NotificationsIndex.layout = page => <MainLayout>{page}</MainLayout>;
export default NotificationsIndex;