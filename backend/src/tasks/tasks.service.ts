/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/activity.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';
import { User } from '../users/user.entity';

const MANAGE_ROLES = ['Admin', 'Project Manager'];

function canManageTask(user: User, task: Task): boolean {
  if (MANAGE_ROLES.includes(user.role?.name)) {
    return true;
  }
  return task.assignee?.id === user.id || task.createdBy?.id === user.id;
}

export interface TaskFilters {
  projectId?: number;
  assigneeId?: number;
  status?: TaskStatus;
  priority?: string;
  mine?: number;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly activitiesService: ActivitiesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getAllTasks(filters: TaskFilters = {}): Promise<Task[]> {
    const where: any = {};
    if (filters.projectId) where.project = { id: filters.projectId };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.mine) where.assignee = { id: filters.mine };
    else if (filters.assigneeId) where.assignee = { id: filters.assigneeId };
    return this.taskRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async getTaskById(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async createTask(dto: CreateTaskDto, currentUserId: number): Promise<Task> {
    const { projectId, assigneeId, ...rest } = dto;
    const task = this.taskRepository.create({
      ...rest,
      ...(projectId ? { project: { id: projectId } as any } : {}),
      ...(assigneeId ? { assignee: { id: assigneeId } as any } : {}),
      createdBy: { id: currentUserId } as any,
    });
    const saved = await this.taskRepository.save(task);
    const full = await this.getTaskById(saved.id);

    await this.activitiesService.log({
      userId: currentUserId,
      type: ActivityType.TASK_CREATED,
      entityType: 'task',
      entityId: full.id,
      description: `created task '${full.title}'`,
    });

    if (assigneeId) {
      await this.notificationsService.create({
        userId: assigneeId,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New task assigned',
        message: `You were assigned the task '${full.title}'`,
      });
    }

    return full;
  }

  async updateTask(id: number, dto: UpdateTaskDto, currentUser: User): Promise<Task> {
    const existing = await this.getTaskById(id);
    if (!canManageTask(currentUser, existing)) {
      throw new ForbiddenException('You do not have permission to update this task');
    }
    const { projectId, assigneeId, ...rest } = dto;
    const wasDone = existing.status === TaskStatus.DONE;
    const willBeDone = dto.status === TaskStatus.DONE;

    await this.taskRepository.save({
      id,
      ...rest,
      ...(projectId !== undefined ? { project: projectId ? ({ id: projectId } as any) : null } : {}),
      ...(assigneeId !== undefined ? { assignee: assigneeId ? ({ id: assigneeId } as any) : null } : {}),
      ...(!wasDone && willBeDone ? { completedAt: new Date() } : {}),
      ...(wasDone && dto.status && dto.status !== TaskStatus.DONE ? { completedAt: null } : {}),
    });

    const updated = await this.getTaskById(id);

    await this.activitiesService.log({
      userId: currentUser.id,
      type: !wasDone && willBeDone ? ActivityType.TASK_COMPLETED : ActivityType.TASK_UPDATED,
      entityType: 'task',
      entityId: updated.id,
      description:
        !wasDone && willBeDone
          ? `completed task '${updated.title}'`
          : `updated task '${updated.title}'`,
    });

    return updated;
  }

  async deleteTask(id: number, currentUser: User): Promise<void> {
    const existing = await this.getTaskById(id);
    if (!canManageTask(currentUser, existing)) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }
    await this.taskRepository.delete(id);
  }
}
