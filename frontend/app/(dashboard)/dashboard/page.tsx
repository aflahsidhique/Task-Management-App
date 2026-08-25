'use client';

import { useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaClipboardList,
  FaExclamationTriangle,
  FaFolder,
  FaProjectDiagram,
} from 'react-icons/fa';
import DashboardService, { DashboardSummary } from '../../../services/dashboardService';
import PageHeader from '../../../components/layout/PageHeader';
import LoadingDots from '../../../components/ui/LoadingDots';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import DateRangePicker from '../../../components/ui/DateRangePicker';
import TeamMembersCard from '../../../components/dashboard/TeamMembersCard';
import DonutChart from '../../../components/dashboard/DonutChart';
import TasksOverviewChart from '../../../components/dashboard/TasksOverviewChart';
import RecentActivities from '../../../components/dashboard/RecentActivities';
import UpcomingDeadlines from '../../../components/dashboard/UpcomingDeadlines';
import TopProjects from '../../../components/dashboard/TopProjects';
import TeamWorkload from '../../../components/dashboard/TeamWorkload';
import RecentProjectsTable from '../../../components/dashboard/RecentProjectsTable';
import MyTasksTable from '../../../components/dashboard/MyTasksTable';

function defaultRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

export default function DashboardPage() {
  const [range, setRange] = useState(defaultRange());
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    DashboardService.getSummary(range.from, range.to)
      .then(setSummary)
      .catch((err) => console.error('Failed to load dashboard summary:', err))
      .finally(() => setLoading(false));
  }, [range.from, range.to]);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        extra={
          <>
            <DateRangePicker
              from={range.from}
              to={range.to}
              onChange={(from, to) => setRange({ from, to })}
            />
            <button className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700">
              Customize
            </button>
          </>
        }
        right={<TeamMembersCard metric={summary.teamMembers} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Total Projects"
          value={summary.stats.totalProjects.value}
          deltaPercent={summary.stats.totalProjects.deltaPercent}
          icon={<FaFolder />}
        />
        <StatCard
          label="Active Projects"
          value={summary.stats.activeProjects.value}
          deltaPercent={summary.stats.activeProjects.deltaPercent}
          icon={<FaProjectDiagram />}
          iconBgClassName="bg-success-bg text-success"
        />
        <StatCard
          label="Completed Tasks"
          value={summary.stats.completedTasks.value}
          deltaPercent={summary.stats.completedTasks.deltaPercent}
          icon={<FaCheckCircle />}
          iconBgClassName="bg-info-bg text-info"
        />
        <StatCard
          label="Pending Tasks"
          value={summary.stats.pendingTasks.value}
          deltaPercent={summary.stats.pendingTasks.deltaPercent}
          icon={<FaClipboardList />}
          iconBgClassName="bg-warning-bg text-warning"
        />
        <StatCard
          label="Overdue Tasks"
          value={summary.stats.overdueTasks.value}
          deltaPercent={summary.stats.overdueTasks.deltaPercent}
          icon={<FaExclamationTriangle />}
          iconBgClassName="bg-danger-bg text-danger"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Card title="Project Progress">
          <DonutChart data={summary.projectProgress} />
        </Card>
        <Card title="Tasks Overview" className="xl:col-span-1">
          <TasksOverviewChart data={summary.tasksOverview} />
        </Card>
        <Card title="Task Status">
          <DonutChart data={summary.taskStatus} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card title="Recent Activities">
          <RecentActivities activities={summary.recentActivities} />
        </Card>
        <Card title="Upcoming Deadlines">
          <UpcomingDeadlines deadlines={summary.upcomingDeadlines} />
        </Card>
        <Card title="Top Projects">
          <TopProjects projects={summary.topProjects} />
        </Card>
        <Card title="Team Workload">
          <TeamWorkload workload={summary.teamWorkload} />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Recent Projects">
          <RecentProjectsTable projects={summary.recentProjects} />
        </Card>
        <Card title="My Tasks">
          <MyTasksTable tasks={summary.myTasks} />
        </Card>
      </div>
    </div>
  );
}
