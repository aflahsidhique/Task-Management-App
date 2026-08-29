/* eslint-disable prettier/prettier */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesService } from './roles.service';
import { Role } from './role.entity';

describe('RolesService', () => {
  let service: RolesService;
  let repository: Repository<Role>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getRepositoryToken(Role), useClass: Repository },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRoleById', () => {
    it('throws NotFoundException for an unknown id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getRoleById(999)).rejects.toThrow(NotFoundException);
    });

    it('returns the role when found', async () => {
      const role = { id: 1, name: 'Admin' } as Role;
      jest.spyOn(repository, 'findOne').mockResolvedValue(role);

      await expect(service.getRoleById(1)).resolves.toEqual(role);
    });
  });

  describe('createRole', () => {
    it('creates and saves a role with the given permissions', async () => {
      const dto = { name: 'Custom', permissions: ['manage_tasks'] } as any;
      const created = { id: 5, ...dto } as Role;
      jest.spyOn(repository, 'create').mockReturnValue(created);
      jest.spyOn(repository, 'save').mockResolvedValue(created);

      const result = await service.createRole(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('updateRole', () => {
    it('throws NotFoundException when the role does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateRole(999, { name: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates and returns the refreshed role', async () => {
      const role = { id: 1, name: 'Old' } as Role;
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(role)
        .mockResolvedValueOnce({ ...role, name: 'New' } as Role);
      const updateSpy = jest
        .spyOn(repository, 'update')
        .mockResolvedValue({} as any);

      const result = await service.updateRole(1, { name: 'New' } as any);

      expect(updateSpy).toHaveBeenCalledWith(1, { name: 'New' });
      expect(result.name).toBe('New');
    });
  });

  describe('deleteRole', () => {
    it('throws NotFoundException when nothing was deleted', async () => {
      jest
        .spyOn(repository, 'softDelete')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.deleteRole(1)).rejects.toThrow(NotFoundException);
    });

    it('soft-deletes an existing role', async () => {
      const spy = jest
        .spyOn(repository, 'softDelete')
        .mockResolvedValue({ affected: 1 } as any);

      await service.deleteRole(1);

      expect(spy).toHaveBeenCalledWith(1);
    });
  });
});
