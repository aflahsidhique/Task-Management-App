/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockActivitiesService = { log: jest.fn() };
  const mockNotificationsService = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
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

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates getAllTasks to the service with the current user id', () => {
    const spy = jest
      .spyOn(service, 'getAllTasks')
      .mockResolvedValue({ items: [], meta: {} as any });
    const user: any = { id: 7 };

    controller.getAllTasks({} as any, user);

    expect(spy).toHaveBeenCalledWith({}, 7);
  });

  it('delegates bulkUpdateTasks to the service', () => {
    const spy = jest.spyOn(service, 'bulkUpdateTasks').mockResolvedValue([]);
    const dto: any = { ids: [1, 2], changes: {} };
    const user: any = { id: 1 };

    controller.bulkUpdateTasks(dto, user);

    expect(spy).toHaveBeenCalledWith(dto, user);
  });
});
