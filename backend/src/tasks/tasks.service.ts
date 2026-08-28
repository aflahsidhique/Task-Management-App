/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { BulkUpdateTasksDto } from './dto/bulk-update-tasks.dto';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/activity.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';
import { User } from '../users/user.entity';
import { PaginatedResult, paginate } from '../common/dto/paginated-result';

const MANAGE_ROLES = ['Super Admin', 'Admin', 'Project Manager'];
const SORTABLE_COLUMNS = ['id', 'title', 'status', 'priority', 'dueDate', 'createdAt'];

function canManageTask(user: User, task: Task): boolean {
  if (MANAGE_ROLES.includes(user.role?.name)) {
    return true;
  }
  return task.assignee?.id === user.id || task.reporter?.id === user.id;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly activitiesService: ActivitiesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getAllTasks(
    query: ListTasksQueryDto,
    currentUserId?: number,
  ): Promise<PaginatedResult<Task>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = SORTABLE_COLUMNS.includes(query.sortBy ?? '')
      ? query.sortBy
      : 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.reporter', 'reporter');

    if (query.search) {
      qb.andWhere('(task.title ILIKE :search OR task.description ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }
    if (query.projectId) {
      qb.andWhere('project.id = :projectId', { projectId: query.projectId });
    }
    if (query.status) {
      qb.andWhere('task.status = :status', { status: query.status });
    }
    if (query.priority) {
      qb.andWhere('task.priority = :priority', { priority: query.priority });
    }
    if (query.mine && currentUserId) {
      qb.andWhere('assignee.id = :mineId', { mineId: currentUserId });
    } else if (query.assigneeId) {
      qb.andWhere('assignee.id = :assigneeId', { assigneeId: query.assigneeId });
    }

    qb.orderBy(`task.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalItems] = await qb.getManyAndCount();
    return paginate(items, totalItems, page, limit);
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
      reporter: { id: currentUserId } as any,
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

  async bulkUpdateTasks(dto: BulkUpdateTasksDto, currentUser: User): Promise<Task[]> {
    const tasks = await this.taskRepository.find({ where: { id: In(dto.ids) } });
    if (tasks.length !== dto.ids.length) {
      const found = new Set(tasks.map((t) => t.id));
      const missing = dto.ids.filter((id) => !found.has(id));
      throw new NotFoundException(`Task(s) not found: ${missing.join(', ')}`);
    }
    const unauthorized = tasks.filter((t) => !canManageTask(currentUser, t));
    if (unauthorized.length > 0) {
      throw new ForbiddenException(
        `You do not have permission to update task(s): ${unauthorized.map((t) => t.id).join(', ')}`,
      );
    }

    const { status, priority, assigneeId, projectId } = dto.changes;
    const updated: Task[] = [];
    for (const task of tasks) {
      const wasDone = task.status === TaskStatus.DONE;
      const willBeDone = status === TaskStatus.DONE;
      await this.taskRepository.save({
        id: task.id,
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(assigneeId !== undefined ? { assignee: { id: assigneeId } as any } : {}),
        ...(projectId !== undefined ? { project: { id: projectId } as any } : {}),
        ...(!wasDone && willBeDone ? { completedAt: new Date() } : {}),
        ...(wasDone && status && status !== TaskStatus.DONE ? { completedAt: null } : {}),
      });
      const full = await this.getTaskById(task.id);
      updated.push(full);
      await this.activitiesService.log({
        userId: currentUser.id,
        type: !wasDone && willBeDone ? ActivityType.TASK_COMPLETED : ActivityType.TASK_UPDATED,
        entityType: 'task',
        entityId: full.id,
        description: `bulk-updated task '${full.title}'`,
      });
    }
    return updated;
  }

  async deleteTask(id: number, currentUser: User): Promise<void> {
    const existing = await this.getTaskById(id);
    if (!canManageTask(currentUser, existing)) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }
    await this.taskRepository.softDelete(id);
  }
}
