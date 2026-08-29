/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, Not, Repository } from 'typeorm';
import { Task, TaskStatus } from '../tasks/task.entity';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResult, paginate } from '../common/dto/paginated-result';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private range(from?: string, to?: string) {
    if (!from || !to) return undefined;
    return Between(new Date(from), new Date(to));
  }

  async byProject(from?: string, to?: string) {
    const projects = await this.projectRepository.find();
    const createdAt = this.range(from, to);
    return Promise.all(
      projects.map(async (p) => {
        const where: any = { project: { id: p.id } };
        if (createdAt) where.createdAt = createdAt;
        const totalTasks = await this.taskRepository.count({ where });
        const completedTasks = totalTasks
          ? await this.taskRepository.count({
              where: { ...where, status: TaskStatus.DONE },
            })
          : 0;
        return {
          projectId: p.id,
          projectName: p.name,
          totalTasks,
          completedTasks,
          completionRate: totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0,
        };
      }),
    );
  }

  async byUser(from?: string, to?: string) {
    const users = await this.userRepository.find();
    const createdAt = this.range(from, to);
    return Promise.all(
      users.map(async (u) => {
        const where: any = { assignee: { id: u.id } };
        if (createdAt) where.createdAt = createdAt;
        const totalTasks = await this.taskRepository.count({ where });
        const completedTasks = totalTasks
          ? await this.taskRepository.count({
              where: { ...where, status: TaskStatus.DONE },
            })
          : 0;
        return {
          userId: u.id,
          userName: u.fullName,
          totalTasks,
          completedTasks,
          completionRate: totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0,
        };
      }),
    ).then((rows) => rows.filter((r) => r.totalTasks > 0));
  }

  async byStatus(from?: string, to?: string) {
    const createdAt = this.range(from, to);
    const statuses = Object.values(TaskStatus);
    return Promise.all(
      statuses.map(async (status) => {
        const where: any = { status };
        if (createdAt) where.createdAt = createdAt;
        const count = await this.taskRepository.count({ where });
        return { status, count };
      }),
    );
  }

  /** Per-project progress: task completion percent, plus how many of the project's tasks are overdue. */
  async projectProgress() {
    const projects = await this.projectRepository.find();
    const today = new Date();
    return Promise.all(
      projects.map(async (p) => {
        const totalTasks = await this.taskRepository.count({
          where: { project: { id: p.id } },
        });
        const completedTasks = totalTasks
          ? await this.taskRepository.count({
              where: { project: { id: p.id }, status: TaskStatus.DONE },
            })
          : 0;
        const overdueTasks = await this.taskRepository.count({
          where: {
            project: { id: p.id },
            status: Not(TaskStatus.DONE),
            dueDate: LessThan(today),
          },
        });
        return {
          projectId: p.id,
          projectName: p.name,
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate,
          totalTasks,
          completedTasks,
          overdueTasks,
          progressPercent: totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0,
        };
      }),
    );
  }

  /** Per-user productivity: workload, completion rate, and how often work finishes on time. */
  async userProductivity(from?: string, to?: string) {
    const users = await this.userRepository.find();
    const createdAt = this.range(from, to);
    const rows = await Promise.all(
      users.map(async (u) => {
        const where: any = { assignee: { id: u.id } };
        if (createdAt) where.createdAt = createdAt;
        const totalAssigned = await this.taskRepository.count({ where });
        if (totalAssigned === 0) return null;

        const completedTasks = await this.taskRepository.find({
          where: { ...where, status: TaskStatus.DONE },
        });
        const onTime = completedTasks.filter((t) => {
          if (!t.dueDate) return true;
          if (!t.completedAt) return false;
          return new Date(t.completedAt) <= new Date(t.dueDate);
        }).length;
        const overdueOpen = await this.taskRepository.count({
          where: {
            ...where,
            status: Not(TaskStatus.DONE),
            dueDate: LessThan(new Date()),
          },
        });

        return {
          userId: u.id,
          userName: u.fullName,
          totalAssigned,
          completedTasks: completedTasks.length,
          overdueOpenTasks: overdueOpen,
          completionRate: Math.round(
            (completedTasks.length / totalAssigned) * 100,
          ),
          onTimeRate: completedTasks.length
            ? Math.round((onTime / completedTasks.length) * 100)
            : 0,
        };
      }),
    );
    return rows.filter((r): r is NonNullable<typeof r> => r !== null);
  }

  /** Daily created-vs-completed task counts over a date range (defaults to the last 30 days). */
  async taskCompletionTrend(from?: string, to?: string) {
    const end = to ? new Date(to) : new Date();
    const start = from
      ? new Date(from)
      : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const [created, completed] = await Promise.all([
      this.taskRepository.find({ where: { createdAt: Between(start, end) } }),
      this.taskRepository.find({
        where: { status: TaskStatus.DONE, completedAt: Between(start, end) },
      }),
    ]);

    const days: { date: string; created: number; completed: number }[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({
        date: d.toISOString().slice(0, 10),
        created: 0,
        completed: 0,
      });
    }
    const byDate = new Map(days.map((d) => [d.date, d]));
    for (const task of created) {
      const key = task.createdAt.toISOString().slice(0, 10);
      const bucket = byDate.get(key);
      if (bucket) bucket.created += 1;
    }
    for (const task of completed) {
      if (!task.completedAt) continue;
      const key = task.completedAt.toISOString().slice(0, 10);
      const bucket = byDate.get(key);
      if (bucket) bucket.completed += 1;
    }
    return days;
  }

  /** Flat, paginated list of tasks that are currently overdue. */
  async overdueTasks(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Task>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, totalItems] = await this.taskRepository.findAndCount({
      where: { status: Not(TaskStatus.DONE), dueDate: LessThan(new Date()) },
      order: { dueDate: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(items, totalItems, page, limit);
  }
}
