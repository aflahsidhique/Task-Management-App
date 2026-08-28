import apiClient, { unwrap } from '../lib/apiClient';

export interface ByProjectReportRow {
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export interface ByUserReportRow {
  userId: number;
  userName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export interface ByStatusReportRow {
  status: string;
  count: number;
}

class ReportService {
  static async byProject(from?: string, to?: string): Promise<ByProjectReportRow[]> {
    return unwrap(apiClient.get('/reports/by-project', { params: { from, to } }));
  }

  static async byUser(from?: string, to?: string): Promise<ByUserReportRow[]> {
    return unwrap(apiClient.get('/reports/by-user', { params: { from, to } }));
  }

  static async byStatus(from?: string, to?: string): Promise<ByStatusReportRow[]> {
    return unwrap(apiClient.get('/reports/by-status', { params: { from, to } }));
  }
}

export default ReportService;
