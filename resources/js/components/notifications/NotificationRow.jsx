import { router } from '@inertiajs/react';

// ─── Type config ─────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  light_earned:  { icon: '✦', color: '#c9a0ff' },
  achievement:   { icon: '💠', color: '#ffcc44' },
  new_content:   { icon: '◈', color: '#00ccaa' },
  system:        { icon: '⚙', color: '#888' },
};

const typeIcon  = (type) => TYPE_CONFIG[type]?.icon  ?? '·';
const typeColor = (type) => TYPE_CONFIG[type]?.color ?? '#888';

// ─── Time formatting ─────────────────────────────────────────────────────────

const timeAgo = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);

  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
};

// ─── Component ───────────────────────────────────────────────────────────────

const NotificationRow = ({ notification, onMarkRead, onDelete }) => {
  const isUnread = !notification.read_at;

  const handleClick = () => {
    if (isUnread) onMarkRead(notification.id);

    if (notification.action_url) {
      router.visit(notification.action_url);
    }
  };

  return (
    <div
      className={`notif-bell__row 
        ${isUnread ? 'notif-bell__row--unread' : ''} 
        ${notification.action_url ? 'notif-bell__row--clickable' : ''}`}
      onClick={notification.action_url ? handleClick : undefined}
    >
      <div
        className="notif-bell__row-icon"
        style={{ color: typeColor(notification.type) }}
      >
        {typeIcon(notification.type)}
      </div>

      <div className="notif-bell__row-body">
        <div className="notif-bell__row-title">{notification.title}</div>

        {notification.message && (
          <div className="notif-bell__row-msg">{notification.message}</div>
        )}

        <div className="notif-bell__row-time">
          {timeAgo(notification.created_at)}
        </div>
      </div>

      <div className="notif-bell__row-actions">
        {isUnread && (
          <button
            className="notif-bell__row-dot"
            title="Mark as read"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
          />
        )}

        <button
          className="notif-bell__row-delete"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationRow;