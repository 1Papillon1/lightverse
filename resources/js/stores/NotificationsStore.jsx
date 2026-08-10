import { makeAutoObservable } from 'mobx';

class NotificationsStore {
  notifications = [];
  unreadCount   = 0;
  _pollInterval = null;

  constructor() {
    makeAutoObservable(this);
  }

  hydrate(notifications, unreadCount) {
    this.notifications = notifications ?? [];
    this.unreadCount   = unreadCount   ?? 0;
  }

  setNotifications(notifications) {
    this.notifications = notifications;
    this.unreadCount   = notifications.filter(n => !n.read_at).length;
  }

  markRead(id) {
    this.notifications = this.notifications.map(n =>
      n.id === id ? { ...n, read_at: new Date().toISOString() } : n
    );
    this.unreadCount = this.notifications.filter(n => !n.read_at).length;
  }

  markAllRead() {
    this.notifications = this.notifications.map(n => ({
      ...n,
      read_at: n.read_at ?? new Date().toISOString(),
    }));
    this.unreadCount = 0;
  }

  remove(id) {
    const wasUnread = this.notifications.find(n => n.id === id && !n.read_at);
    this.notifications = this.notifications.filter(n => n.id !== id);
    if (wasUnread) this.unreadCount = Math.max(0, this.unreadCount - 1);
  }

  async refresh() {
    try {
      const res  = await fetch('/api/notifications', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const data = await res.json();
      // Only update if something actually changed — prevents unnecessary re-renders
      const incoming = data.notifications ?? [];
      if (JSON.stringify(incoming) !== JSON.stringify(this.notifications)) {
        this.setNotifications(incoming);
      }
    } catch (e) {
      console.warn('Notification refresh failed', e);
    }
  }


  startPolling(intervalMs = 30000) {
    this.stopPolling();
    this.refresh(); // immediate first fetch
    this._pollInterval = setInterval(() => this.refresh(), intervalMs);
  }

  stopPolling() {
    if (this._pollInterval) {
      clearInterval(this._pollInterval);
      this._pollInterval = null;
    }
  }
}

export default NotificationsStore;