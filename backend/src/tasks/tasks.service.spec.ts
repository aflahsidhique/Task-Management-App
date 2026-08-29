/* eslint-disable prettier/prettier */
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskDto } from './create-task.dto';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../users/user.entity';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  const mockActivitiesService = { log: jest.fn() };
  const mockNotificationsService = { create: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
        { provide: ActivitiesService, useValue: mockActivitiesService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTasks', () => {
    it('paginates via the query builder and falls back to createdAt sorting', async () => {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1 } as Task], 1]),
      };
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(qb);

      const result = await service.getAllTasks({ sortBy: 'not-a-real-column' } as any);

      expect(qb.orderBy).toHaveBeenCalledWith('task.createdAt', 'DESC');
      expect(result.items).toEqual([{ id: 1 }]);
      expect(result.meta.totalItems).toBe(1);
    });
  });

  describe('createTask', () => {
    it('creates a task, assigns the reporter, and logs an activity', async () => {
      const dto: CreateTaskDto = { title: 'Test task', description: 'Test description' };
      jest.spyOn(repository, 'create').mockReturnValue({ id: 1 } as Task);
      jest.spyOn(repository, 'save').mockResolvedValue({ id: 1 } as Task);
      jest.spyOn(service, 'getTaskById').mockResolvedValue({ id: 1, title: 'Test task' } as Task);

      const result = await service.createTask(dto, 42);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Test task', reporter: { id: 42 } }),
      );
      expect(mockActivitiesService.log).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 42, entityType: 'task' }),
      );
      expect(result).toEqual({ id: 1, title: 'Test task' });
    });

    it('notifies the assignee when the task is assigned on creation', async () => {
      const dto: CreateTaskDto = {
        title: 'Test task',
        description: 'Test description',
        assigneeId: 5,
      };
      jest.spyOn(repository, 'create').mockReturnValue({ id: 1 } as Task);
      jest.spyOn(repository, 'save').mockResolvedValue({ id: 1 } as Task);
      jest.spyOn(service, 'getTaskById').mockResolvedValue({ id: 1, title: 'Test task' } as Task);

      await service.createTask(dto, 42);

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 5 }),
      );
    });
  });

  describe('updateTask', () => {
    it('rejects updates from a user who neither owns nor manages the task', async () => {
      const existing = {
        id: 1,
        status: TaskStatus.TODO,
        assignee: { id: 99 },
        reporter: { id: 99 },
      } as Task;
      jest.spyOn(service, 'getTaskById').mockResolvedValue(existing);
      const outsider = { id: 1, role: { name: 'Developer' } } as User;

      await expect(service.updateTask(1, {}, outsider)).rejects.toThrow(ForbiddenException);
    });

    it('stamps completedAt when a task transitions into DONE', async () => {
      const existing = {
        id: 1,
        status: TaskStatus.IN_PROGRESS,
        assignee: { id: 1 },
        reporter: { id: 1 },
      } as Task;
      const manager = { id: 1, role: { name: 'Admin' } } as User;
      jest.spyOn(service, 'getTaskById').mockResolvedValue(existing);
      const saveSpy = jest.spyOn(repository, 'save').mockResolvedValue({} as any);

      await service.updateTask(1, { status: TaskStatus.DONE }, manager);

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ completedAt: expect.any(Date) }),
      );
    });
  });

  describe('bulkUpdateTasks', () => {
    it('throws NotFoundException when some task ids do not exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([{ id: 1 } as Task]);
      const admin = { id: 1, role: { name: 'Admin' } } as User;

      await expect(
        service.bulkUpdateTasks({ ids: [1, 2], changes: {} }, admin),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when the user cannot manage every selected task', async () => {
      const tasks = [
        { id: 1, assignee: { id: 9 }, reporter: { id: 9 } },
        { id: 2, assignee: { id: 9 }, reporter: { id: 9 } },
      ] as Task[];
      jest.spyOn(repository, 'find').mockResolvedValue(tasks);
      const outsider = { id: 1, role: { name: 'Developer' } } as User;

      await expect(
        service.bulkUpdateTasks({ ids: [1, 2], changes: {} }, outsider),
      ).rejects.toThrow(ForbiddenException);
    });

    it('applies the requested changes to every task the user can manage', async () => {
      const tasks = [
        { id: 1, status: TaskStatus.TODO, assignee: { id: 1 }, reporter: { id: 1 } },
        { id: 2, status: TaskStatus.TODO, assignee: { id: 1 }, reporter: { id: 1 } },
      ] as Task[];
      jest.spyOn(repository, 'find').mockResolvedValue(tasks);
      const saveSpy = jest.spyOn(repository, 'save').mockResolvedValue({} as any);
      jest
        .spyOn(service, 'getTaskById')
        .mockImplementation(async (id: number) => ({ id }) as Task);
      const admin = { id: 1, role: { name: 'Admin' } } as User;

      const result = await service.bulkUpdateTasks(
        { ids: [1, 2], changes: { status: TaskStatus.IN_PROGRESS } },
        admin,
      );

      expect(saveSpy).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });
  });

  describe('deleteTask', () => {
    it('soft-deletes the task when the user can manage it', async () => {
      const existing = { id: 1, assignee: { id: 1 }, reporter: { id: 1 } } as Task;
      jest.spyOn(service, 'getTaskById').mockResolvedValue(existing);
      const softDeleteSpy = jest.spyOn(repository, 'softDelete').mockResolvedValue({} as any);
      const owner = { id: 1, role: { name: 'Developer' } } as User;

      await service.deleteTask(1, owner);

      expect(softDeleteSpy).toHaveBeenCalledWith(1);
    });

    it('rejects deletion from a user who neither owns nor manages the task', async () => {
      const existing = { id: 1, assignee: { id: 99 }, reporter: { id: 99 } } as Task;
      jest.spyOn(service, 'getTaskById').mockResolvedValue(existing);
      const outsider = { id: 1, role: { name: 'Developer' } } as User;

      await expect(service.deleteTask(1, outsider)).rejects.toThrow(ForbiddenException);
    });
  });
});
