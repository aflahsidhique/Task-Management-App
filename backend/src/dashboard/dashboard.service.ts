/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, Not, Repository } from 'typeorm';
import { Project, ProjectStatus } from '../projects/project.entity';
import { Task, TaskStatus } from '../tasks/task.entity';
import { User } from '../users/user.entity';
import { ActivitiesService } from '../activities/activities.service';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(from: Date, to: Date): string[] {
  const days: string[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    days.push(toDateOnly(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async getSummary(fromStr?: string, toStr?: string, currentUserId?: number) {
    const now = new Date();
    const to = toStr ? new Date(toStr) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const from = fromStr ? new Date(fromStr) : new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      stats,
      teamMembers,
      projectProgress,
      taskStatus,
      tasksOverview,
      upcomingDeadlines,
      topProjects,
      teamWorkload,
      recentActivitiesRaw,
      recentProjects,
      myTasks,
    ] = await Promise.all([
      this.computeStats(from, to),
      this.computeTeamMembers(from, to),
      this.computeProjectProgress(),
      this.computeTaskStatus(),
      this.computeTasksOverview(from, to),
      this.computeUpcomingDeadlines(),
      this.computeTopProjects(),
      this.computeTeamWorkload(),
      this.activitiesService.getRecent(6),
      this.computeRecentProjects(),
      currentUserId ? this.computeMyTasks(currentUserId) : Promise.resolve([]),
    ]);

    return {
      dateRange: { from: toDateOnly(from), to: toDateOnly(to) },
      teamMembers,
      stats,
      projectProgress,
      taskStatus,
      tasksOverview,
      upcomingDeadlines,
      topProjects,
      teamWorkload,
      recentActivities: recentActivitiesRaw.map((a) => ({
        id: a.id,
        actorName: a.user?.fullName ?? 'Someone',
        actorAvatar: a.user?.avatarUrl ?? null,
        description: a.description,
        createdAt: a.createdAt,
      })),
      recentProjects,
      myTasks,
    };
  }

  private delta(current: number, previous: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 100);
  }

  private previousWindow(from: Date, to: Date) {
    const spanMs = to.getTime() - from.getTime();
    const prevTo = new Date(from.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - spanMs);
    return { prevFrom, prevTo };
  }

  private async computeStats(from: Date, to: Date) {
    const { prevFrom, prevTo } = this.previousWindow(from, to);
    const today = new Date();

    const [
      totalProjects,
      prevTotalProjects,
      activeProjects,
      prevActiveProjects,
      completedTasks,
      prevCompletedTasks,
      pendingTasks,
      prevPendingTasks,
      overdueTasks,
      prevOverdueTasks,
    ] = await Promise.all([
      this.projectRepository.count({ where: { createdAt: Between(from, to) } }),
      this.projectRepository.count({ where: { createdAt: Between(prevFrom, prevTo) } }),
      this.projectRepository.count({
        where: { status: Not(ProjectStatus.COMPLETED), createdAt: Between(from, to) },
      }),
      this.projectRepository.count({
        where: { status: Not(ProjectStatus.COMPLETED), createdAt: Between(prevFrom, prevTo) },
      }),
      this.taskRepository.count({ where: { status: TaskStatus.DONE, completedAt: Between(from, to) } }),
      this.taskRepository.count({ where: { status: TaskStatus.DONE, completedAt: Between(prevFrom, prevTo) } }),
      this.taskRepository.count({ where: { status: Not(TaskStatus.DONE), createdAt: Between(from, to) } }),
      this.taskRepository.count({ where: { status: Not(TaskStatus.DONE), createdAt: Between(prevFrom, prevTo) } }),
      this.taskRepository.count({ where: { status: Not(TaskStatus.DONE), dueDate: LessThan(today) } }),
      this.taskRepository.count({
        where: { status: Not(TaskStatus.DONE), dueDate: LessThan(prevTo) },
      }),
    ]);

    return {
      totalProjects: { value: totalProjects, deltaPercent: this.delta(totalProjects, prevTotalProjects) },
      activeProjects: { value: activeProjects, deltaPercent: this.delta(activeProjects, prevActiveProjects) },
      completedTasks: { value: completedTasks, deltaPercent: this.delta(completedTasks, prevCompletedTasks) },
      pendingTasks: { value: pendingTasks, deltaPercent: this.delta(pendingTasks, prevPendingTasks) },
      overdueTasks: { value: overdueTasks, deltaPercent: this.delta(overdueTasks, prevOverdueTasks) },
    };
  }

  private async computeTeamMembers(from: Date, to: Date) {
    const { prevTo } = this.previousWindow(from, to);
    const value = await this.userRepository.count();
    const previous = await this.userRepository.count({ where: { createdAt: LessThan(prevTo) } });
    return { value, deltaPercent: this.delta(value, previous || value) };
  }

  private async computeProjectProgress() {
    const projects = await this.projectRepository.find();
    const total = projects.length;
    const buckets: Record<string, number> = {
      Completed: 0,
      'In Progress': 0,
      'Not Started': 0,
      'On Hold': 0,
    };
    for (const p of projects) {
      if (p.status === ProjectStatus.COMPLETED) buckets['Completed']++;
      else if (p.status === ProjectStatus.ON_HOLD) buckets['On Hold']++;
      else if (p.status === ProjectStatus.ON_TRACK || p.status === ProjectStatus.AT_RISK || p.status === ProjectStatus.DELAYED)
        buckets['In Progress']++;
      else buckets['Not Started']++;
    }
    return {
      total,
      segments: Object.entries(buckets).map(([label, count]) => ({
        label,
        count,
        percent: total ? Math.round((count / total) * 100) : 0,
      })),
    };
  }

  private async computeTaskStatus() {
    const tasks = await this.taskRepository.find();
    const total = tasks.length;
    const labels: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: 'To Do',
      [TaskStatus.IN_PROGRESS]: 'In Progress',
      [TaskStatus.IN_REVIEW]: 'In Review',
      [TaskStatus.DONE]: 'Done',
    };
    const counts: Record<string, number> = {
      'To Do': 0,
      'In Progress': 0,
      'In Review': 0,
      Done: 0,
    };
    for (const t of tasks) counts[labels[t.status]]++;
    return {
      total,
      segments: Object.entries(counts).map(([label, count]) => ({
        label,
        count,
        percent: total ? Math.round((count / total) * 100) : 0,
      })),
    };
  }

  private async computeTasksOverview(from: Date, to: Date) {
    const tasks = await this.taskRepository.find();
    const days = daysBetween(from, to);
    return days.map((day) => {
      const dayDate = new Date(day);
      const completed = tasks.filter(
        (t) => t.completedAt && toDateOnly(new Date(t.completedAt)) === day,
      ).length;
      const inProgress = tasks.filter(
        (t) =>
          t.status === TaskStatus.IN_PROGRESS &&
          new Date(t.createdAt) <= dayDate &&
          (!t.completedAt || new Date(t.completedAt) > dayDate),
      ).length;
      const overdue = tasks.filter(
        (t) => t.dueDate && toDateOnly(new Date(t.dueDate)) === day && t.status !== TaskStatus.DONE,
      ).length;
      return { date: day, completed, inProgress, overdue };
    });
  }

  private async computeUpcomingDeadlines() {
    const today = new Date();
    const in14Days = new Date();
    in14Days.setDate(today.getDate() + 14);

    const tasks = await this.taskRepository.find({
      where: { dueDate: Between(today, in14Days), status: Not(TaskStatus.DONE) },
      order: { dueDate: 'ASC' },
      take: 6,
    });

    return tasks.map((t) => ({
      id: t.id,
      type: 'task',
      name: t.title,
      projectName: t.project?.name ?? null,
      priority: t.priority,
      dueDate: t.dueDate,
    }));
  }

  private async computeTopProjects() {
    const projects = await this.projectRepository.find();
    const withProgress = await Promise.all(
      projects.map(async (p) => {
        const total = await this.taskRepository.count({ where: { project: { id: p.id } } });
        const done = total
          ? await this.taskRepository.count({ where: { project: { id: p.id }, status: TaskStatus.DONE } })
          : 0;
        return {
          id: p.id,
          name: p.name,
          progressPercent: total ? Math.round((done / total) * 100) : 0,
          status: p.status,
        };
      }),
    );
    return withProgress.sort((a, b) => b.progressPercent - a.progressPercent).slice(0, 5);
  }

  private async computeTeamWorkload() {
    const users = await this.userRepository.find();
    const workload = await Promise.all(
      users.map(async (u) => {
        const taskCount = await this.taskRepository.count({
          where: { assignee: { id: u.id }, status: Not(TaskStatus.DONE) },
        });
        const total = await this.taskRepository.count({ where: { assignee: { id: u.id } } });
        const done = total
          ? await this.taskRepository.count({ where: { assignee: { id: u.id }, status: TaskStatus.DONE } })
          : 0;
        return {
          userId: u.id,
          name: u.fullName,
          avatarUrl: u.avatarUrl,
          taskCount,
          progressPercent: total ? Math.round((done / total) * 100) : 0,
        };
      }),
    );
    return workload.filter((w) => w.taskCount > 0).sort((a, b) => b.taskCount - a.taskCount).slice(0, 6);
  }

  private async computeRecentProjects() {
    const projects = await this.projectRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });
    return Promise.all(
      projects.map(async (p) => {
        const total = await this.taskRepository.count({ where: { project: { id: p.id } } });
        const done = total
          ? await this.taskRepository.count({ where: { project: { id: p.id }, status: TaskStatus.DONE } })
          : 0;
        return {
          id: p.id,
          name: p.name,
          progressPercent: total ? Math.round((done / total) * 100) : 0,
          memberAvatars: (p.members ?? []).slice(0, 4).map((m) => ({
            id: m.id,
            name: m.fullName,
            avatarUrl: m.avatarUrl,
          })),
          memberCount: p.members?.length ?? 0,
          startDate: p.startDate,
          endDate: p.endDate,
          status: p.status,
        };
      }),
    );
  }

  private async computeMyTasks(userId: number) {
    const tasks = await this.taskRepository.find({
      where: { assignee: { id: userId } },
      order: { dueDate: 'ASC' },
      take: 6,
    });
    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      projectName: t.project?.name ?? null,
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.status,
    }));
  }
}
