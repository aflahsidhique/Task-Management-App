import apiClient, { unwrap } from '../lib/apiClient';

export interface StatMetric {
  value: number;
  deltaPercent: number;
}

export interface DonutSegment {
  label: string;
  count: number;
  percent: number;
}

export interface DonutData {
  total: number;
  segments: DonutSegment[];
}

export interface TasksOverviewRow {
  date: string;
  completed: number;
  inProgress: number;
  overdue: number;
}

export interface UpcomingDeadline {
  id: number;
  type: string;
  name: string;
  projectName: string | null;
  priority: string;
  dueDate: string;
}

export interface TopProject {
  id: number;
  name: string;
  progressPercent: number;
  status: string;
}

export interface TeamWorkloadRow {
  userId: number;
  name: string;
  avatarUrl: string | null;
  taskCount: number;
  progressPercent: number;
}

export interface RecentActivityRow {
  id: number;
  actorName: string;
  actorAvatar: string | null;
  description: string;
  createdAt: string;
}

export interface RecentProjectRow {
  id: number;
  name: string;
  progressPercent: number;
  memberAvatars: { id: number; name: string; avatarUrl: string | null }[];
  memberCount: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface MyTaskRow {
  id: number;
  title: string;
  projectName: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
}

export interface DashboardSummary {
  dateRange: { from: string; to: string };
  teamMembers: StatMetric;
  stats: {
    totalProjects: StatMetric;
    activeProjects: StatMetric;
    completedTasks: StatMetric;
    pendingTasks: StatMetric;
    overdueTasks: StatMetric;
  };
  projectProgress: DonutData;
  taskStatus: DonutData;
  tasksOverview: TasksOverviewRow[];
  upcomingDeadlines: UpcomingDeadline[];
  topProjects: TopProject[];
  teamWorkload: TeamWorkloadRow[];
  recentActivities: RecentActivityRow[];
  recentProjects: RecentProjectRow[];
  myTasks: MyTaskRow[];
}

class DashboardService {
  static async getSummary(from?: string, to?: string): Promise<DashboardSummary> {
    return unwrap(apiClient.get('/dashboard/summary', { params: { from, to } }));
  }
}

export default DashboardService;
