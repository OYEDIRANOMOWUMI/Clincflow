import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, CircleAlert, Info, Sparkles } from 'lucide-react';
import axios from 'axios';
import { API_URL, getAuthHeaders } from '../api';

const iconMap = {
  info: Info,
  warning: CircleAlert,
  success: Sparkles,
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/notifications`, { headers: getAuthHeaders() });
      setItems((response.data?.notifications || []).map((notification) => ({
        id: notification._id,
        title: String(notification.type || 'Notification').replaceAll('_', ' '),
        message: notification.message,
        category: notification.type || 'general',
        time: notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now',
        read: Boolean(notification.isRead)
      })));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const unreadCount = useMemo(
    () => items.filter((notification) => !notification.read).length,
    [items]
  );

  const markAllRead = async () => {
    const unread = items.filter((item) => !item.read);
    try {
      await Promise.all(unread.map((item) => axios.patch(`${API_URL}/notifications/${item.id}/read`, {}, { headers: getAuthHeaders() })));
      setItems((current) => current.map((item) => ({ ...item, read: true })));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to mark notifications as read');
    }
  };

  const markOneRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, { headers: getAuthHeaders() });
      setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to mark notification as read');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
        aria-label="Open notification center"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-30 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Alerts</p>
              <h3 className="text-sm font-bold text-slate-900">Notification center</h3>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-200 hover:text-emerald-700"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>

          {error && <div className="flex items-center justify-between gap-2 border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700"><span>{error}</span><button type="button" onClick={fetchNotifications} className="font-semibold underline">Retry</button></div>}

          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="space-y-2 px-4 py-4"><div className="h-10 animate-pulse rounded-lg bg-slate-100" /><div className="h-10 animate-pulse rounded-lg bg-slate-100" /><div className="h-10 animate-pulse rounded-lg bg-slate-100" /></div>
            ) : items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500">No new alerts right now.</div>
            ) : (
              items.map((notification) => {
                const Icon = iconMap[notification.type] || Info;

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => markOneRead(notification.id)}
                    className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition ${
                      notification.read ? 'bg-white' : 'bg-emerald-50/40'
                    } hover:bg-slate-50`}
                  >
                    <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-700">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                        {!notification.read && (
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{notification.message}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{notification.category}</span>
                        <span>{notification.time}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
