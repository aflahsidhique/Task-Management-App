import apiClient, { unwrap } from '../lib/apiClient';

export type NotificationType = 'TASK_ASSIGNED' | 'TASK_DUE' | 'PROJECT_UPDATE' | 'MENTION' | 'SYSTEM';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

class NotificationService {
  static async getNotifications(): Promise<Notification[]> {
    return unwrap(apiClient.get('/notifications'));
  }

  static async getUnreadCount(): Promise<number> {
    const result = await unwrap<{ count: number }>(apiClient.get('/notifications/unread-count'));
    return result.count;
  }

  static async markAsRead(id: number): Promise<Notification> {
    return unwrap(apiClient.put(`/notifications/${id}/read`));
  }

  static async markAllAsRead(): Promise<void> {
    return unwrap(apiClient.put('/notifications/read-all'));
  }

  static async remove(id: number): Promise<void> {
    return unwrap(apiClient.delete(`/notifications/${id}`));
  }
}

export default NotificationService;
