'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaBell, FaCheckDouble, FaTrashAlt } from 'react-icons/fa';
import NotificationService, { Notification } from '../../../services/notificationService';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import LoadingDots from '../../../components/ui/LoadingDots';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    NotificationService.getNotifications()
      .then(setNotifications)
      .catch((err) => console.error('Failed to load notifications:', err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markAsRead = async (id: number) => {
    await NotificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = async () => {
    await NotificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const remove = async (id: number) => {
    await NotificationService.remove(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        right={
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <FaCheckDouble /> Mark all as read
          </button>
        }
      />
      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingDots />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-gray-400">No notifications.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`py-4 flex items-start gap-3 ${n.isRead ? '' : 'bg-primary-50/40 -mx-5 px-5'}`}
              >
                <div className="h-9 w-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                  <FaBell size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                  <button onClick={() => remove(n.id)} className="text-danger">
                    <FaTrashAlt size={12} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
