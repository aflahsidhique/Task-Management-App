/* eslint-disable prettier/prettier */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { User, UserStatus } from './user.entity';
import { Role } from '../roles/role.entity';

jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed-password') }));

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(Role), useClass: Repository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('paginates and applies search/status/role filters via the query builder', async () => {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1 } as User], 1]),
      };
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(qb);

      const result = await service.findAll({
        page: 2,
        limit: 5,
        search: 'ann',
        status: UserStatus.ACTIVE,
        roleId: 3,
      } as any);

      expect(qb.andWhere).toHaveBeenCalledTimes(3);
      expect(qb.skip).toHaveBeenCalledWith(5);
      expect(qb.take).toHaveBeenCalledWith(5);
      expect(result.meta.currentPage).toBe(2);
      expect(result.items).toEqual([{ id: 1 }]);
    });
  });

  describe('create', () => {
    it('rejects a duplicate email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: 1 } as User);

      await expect(
        service.create({
          fullName: 'Dup',
          email: 'dup@example.com',
          password: 'Password123',
          roleId: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects an unknown roleId', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.create({
          fullName: 'New',
          email: 'new@example.com',
          password: 'Password123',
          roleId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('hashes the password and creates the user with the resolved role', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const role = { id: 1, name: 'Developer' } as Role;
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role);
      const created = { id: 10 } as User;
      jest.spyOn(userRepository, 'create').mockReturnValue(created);
      jest.spyOn(userRepository, 'save').mockResolvedValue(created);

      const result = await service.create({
        fullName: 'New',
        email: 'new@example.com',
        password: 'Password123',
        roleId: 1,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'hashed-password', role }),
      );
      expect(result).toEqual(created);
    });
  });

  describe('setStatus', () => {
    it('revokes the refresh token when deactivating a user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: 1 } as User);
      const updateSpy = jest.spyOn(userRepository, 'update').mockResolvedValue({} as any);

      await service.setStatus(1, UserStatus.INACTIVE);

      expect(updateSpy).toHaveBeenCalledWith(1, { status: UserStatus.INACTIVE });
      expect(updateSpy).toHaveBeenCalledWith(1, { refreshTokenHash: null });
    });

    it('does not touch the refresh token when activating a user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: 1 } as User);
      const updateSpy = jest.spyOn(userRepository, 'update').mockResolvedValue({} as any);

      await service.setStatus(1, UserStatus.ACTIVE);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(1, { status: UserStatus.ACTIVE });
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when nothing was deleted', async () => {
      jest.spyOn(userRepository, 'softDelete').mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('soft-deletes an existing user', async () => {
      const spy = jest
        .spyOn(userRepository, 'softDelete')
        .mockResolvedValue({ affected: 1 } as any);

      await service.remove(1);

      expect(spy).toHaveBeenCalledWith(1);
    });
  });
});
