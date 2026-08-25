import apiClient, { unwrap } from '../lib/apiClient';

export interface Activity {
  id: number;
  type: string;
  entityType: string;
  entityId: number;
  description: string;
  createdAt: string;
  user: { id: number; fullName: string; avatarUrl: string | null } | null;
}

class ActivityService {
  static async getRecent(limit = 20): Promise<Activity[]> {
    return unwrap(apiClient.get('/activities', { params: { limit } }));
  }
}

export default ActivityService;
