/* eslint-disable prettier/prettier */
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentsService } from './comments.service';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: Repository<Comment>;
  let userRepository: Repository<User>;

  const mockActivitiesService = { log: jest.fn() };
  const mockNotificationsService = { create: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: ActivitiesService, useValue: mockActivitiesService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('rejects a comment with neither taskId nor projectId', async () => {
      await expect(
        service.create({ content: 'hi' } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a comment with both taskId and projectId', async () => {
      await expect(
        service.create({ content: 'hi', taskId: 1, projectId: 2 } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates the comment and notifies mentioned users, excluding the author', async () => {
      const author = { id: 1, fullName: 'Author' } as User;
      const mentioned = { id: 2 } as User;
      jest.spyOn(userRepository, 'find').mockResolvedValue([author, mentioned]);
      jest.spyOn(commentRepository, 'create').mockReturnValue({ id: 10 } as Comment);
      jest.spyOn(commentRepository, 'save').mockResolvedValue({ id: 10 } as Comment);
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue({
        id: 10,
        content: 'hi @author @mentioned',
        author,
        task: { id: 5 } as any,
        project: null,
        mentions: [author, mentioned],
      } as Comment);

      await service.create(
        { content: 'hi @author @mentioned', taskId: 5, mentionedUserIds: [1, 2] } as any,
        1,
      );

      expect(mockNotificationsService.create).toHaveBeenCalledTimes(1);
      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 2 }),
      );
      expect(mockActivitiesService.log).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'task', entityId: 5 }),
      );
    });
  });

  describe('update', () => {
    it('rejects an edit from someone other than the author', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue({
        id: 10,
        author: { id: 1 },
        mentions: [],
      } as Comment);
      const stranger = { id: 2 } as User;

      await expect(
        service.update(10, { content: 'edited' } as any, stranger),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows the author to edit their own comment', async () => {
      const author = { id: 1 } as User;
      jest
        .spyOn(commentRepository, 'findOne')
        .mockResolvedValueOnce({ id: 10, author, mentions: [] } as Comment)
        .mockResolvedValueOnce({
          id: 10,
          author,
          content: 'edited',
          mentions: [],
          task: null,
          project: { id: 3 } as any,
        } as Comment);
      const saveSpy = jest.spyOn(commentRepository, 'save').mockResolvedValue({} as any);

      const result = await service.update(10, { content: 'edited' } as any, author);

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 10, content: 'edited' }),
      );
      expect(result.content).toBe('edited');
    });
  });

  describe('remove', () => {
    it('allows the author to delete their own comment', async () => {
      const author = { id: 1 } as User;
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue({
        id: 10,
        author,
        task: { id: 5 } as any,
        project: null,
      } as Comment);
      const softDeleteSpy = jest.spyOn(commentRepository, 'softDelete').mockResolvedValue({} as any);

      await service.remove(10, author);

      expect(softDeleteSpy).toHaveBeenCalledWith(10);
    });

    it('allows a Project Manager to delete a comment they did not author', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue({
        id: 10,
        author: { id: 1 },
        task: { id: 5 } as any,
        project: null,
      } as Comment);
      jest.spyOn(commentRepository, 'softDelete').mockResolvedValue({} as any);
      const manager = { id: 99, role: { name: 'Project Manager' } } as User;

      await expect(service.remove(10, manager)).resolves.toBeUndefined();
    });

    it('rejects deletion from an unrelated developer', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue({
        id: 10,
        author: { id: 1 },
        task: { id: 5 } as any,
        project: null,
      } as Comment);
      const outsider = { id: 2, role: { name: 'Developer' } } as User;

      await expect(service.remove(10, outsider)).rejects.toThrow(ForbiddenException);
    });
  });
});
