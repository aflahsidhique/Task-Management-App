/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Task, TaskStatus } from '../tasks/task.entity';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

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
          ? await this.taskRepository.count({ where: { ...where, status: TaskStatus.DONE } })
          : 0;
        return {
          projectId: p.id,
          projectName: p.name,
          totalTasks,
          completedTasks,
          completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
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
          ? await this.taskRepository.count({ where: { ...where, status: TaskStatus.DONE } })
          : 0;
        return {
          userId: u.id,
          userName: u.fullName,
          totalTasks,
          completedTasks,
          completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
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
}
