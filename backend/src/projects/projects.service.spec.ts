/* eslint-disable prettier/prettier */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsService } from './projects.service';
import { Project, ProjectStatus } from './project.entity';
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';
import { ActivitiesService } from '../activities/activities.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepository: Repository<Project>;
  let userRepository: Repository<User>;
  let taskRepository: Repository<Task>;

  const mockActivitiesService = { log: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(Task), useClass: Repository },
        { provide: ActivitiesService, useValue: mockActivitiesService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));

    jest.spyOn(taskRepository, 'count').mockResolvedValue(0);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllProjects', () => {
    it('resolves the page of IDs first, then re-fetches full entities in the same order', async () => {
      const idQb: any = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([[{ id: 2 }, { id: 1 }], 2]),
      };
      jest.spyOn(projectRepository, 'createQueryBuilder').mockReturnValue(idQb);
      jest
        .spyOn(projectRepository, 'find')
        .mockResolvedValue([
          { id: 1, name: 'A', members: [] } as Project,
          { id: 2, name: 'B', members: [] } as Project,
        ]);

      const result = await service.getAllProjects({} as any);

      expect(result.items.map((p) => p.id)).toEqual([2, 1]);
      expect(result.meta.totalItems).toBe(2);
    });

    it('returns an empty page without querying full entities when no rows match', async () => {
      const idQb: any = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      jest.spyOn(projectRepository, 'createQueryBuilder').mockReturnValue(idQb);
      const findSpy = jest.spyOn(projectRepository, 'find');

      const result = await service.getAllProjects({} as any);

      expect(findSpy).not.toHaveBeenCalled();
      expect(result.items).toEqual([]);
    });
  });

  describe('createProject', () => {
    it('rejects when the owner does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createProject(
          {
            name: 'X',
            startDate: '2026-01-01',
            endDate: '2026-02-01',
            ownerId: 999,
          } as any,
          1,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates the project and logs a PROJECT_CREATED activity', async () => {
      const owner = { id: 1 } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(owner);
      const saved = { id: 5, name: 'X', members: [] } as Project;
      jest.spyOn(projectRepository, 'create').mockReturnValue(saved);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(saved);

      const result = await service.createProject(
        {
          name: 'X',
          status: ProjectStatus.ON_TRACK,
          startDate: '2026-01-01',
          endDate: '2026-02-01',
          ownerId: 1,
        } as any,
        1,
      );

      expect(mockActivitiesService.log).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'project', entityId: 5 }),
      );
      expect(result.id).toBe(5);
    });
  });

  describe('deleteProject', () => {
    it('throws NotFoundException when nothing was deleted', async () => {
      jest
        .spyOn(projectRepository, 'softDelete')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.deleteProject(1)).rejects.toThrow(NotFoundException);
    });

    it('soft-deletes an existing project', async () => {
      const spy = jest
        .spyOn(projectRepository, 'softDelete')
        .mockResolvedValue({ affected: 1 } as any);

      await service.deleteProject(1);

      expect(spy).toHaveBeenCalledWith(1);
    });
  });

  describe('addMember / removeMember', () => {
    it('does not duplicate a member who is already on the project', async () => {
      const existingMember = { id: 2 } as User;
      const project = { id: 1, members: [existingMember] } as Project;
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingMember);
      const saveSpy = jest.spyOn(projectRepository, 'save');

      await service.addMember(1, 2);

      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('removes a member from the project', async () => {
      const members = [{ id: 2 } as User, { id: 3 } as User];
      const project = { id: 1, members } as Project;
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);
      const saveSpy = jest
        .spyOn(projectRepository, 'save')
        .mockResolvedValue(project);

      await service.removeMember(1, 2);

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ members: [{ id: 3 }] }),
      );
    });
  });
});
