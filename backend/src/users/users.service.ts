/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from './user.entity';
import { Role } from '../roles/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { PaginatedResult, paginate } from '../common/dto/paginated-result';

const SALT_ROUNDS = 10;
const SORTABLE_COLUMNS = ['id', 'fullName', 'email', 'status', 'createdAt'];

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(query: ListUsersQueryDto): Promise<PaginatedResult<User>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = SORTABLE_COLUMNS.includes(query.sortBy ?? '')
      ? query.sortBy
      : 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role');

    if (query.search) {
      qb.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }
    if (query.status) {
      qb.andWhere('user.status = :status', { status: query.status });
    }
    if (query.roleId) {
      qb.andWhere('role.id = :roleId', { roleId: query.roleId });
    }

    qb.orderBy(`user.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalItems] = await qb.getManyAndCount();
    return paginate(items, totalItems, page, limit);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByIdWithRefreshToken(id: number): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.id = :id', { id })
      .getOne();
  }

  async findByValidPasswordResetHash(hash: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.passwordResetTokenHash = :hash', { hash })
      .andWhere('user.passwordResetExpiresAt > :now', { now: new Date() })
      .getOne();
  }

  async setRefreshTokenHash(
    id: number,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.userRepository.update(id, { refreshTokenHash });
  }

  async setPasswordResetToken(
    id: number,
    passwordResetTokenHash: string | null,
    passwordResetExpiresAt: Date | null,
  ): Promise<void> {
    await this.userRepository.update(id, {
      passwordResetTokenHash,
      passwordResetExpiresAt,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    const role = await this.roleRepository.findOne({
      where: { id: createUserDto.roleId },
    });
    if (!role) {
      throw new NotFoundException(
        `Role with ID ${createUserDto.roleId} not found`,
      );
    }
    const passwordHash = await bcrypt.hash(createUserDto.password, SALT_ROUNDS);
    const user = this.userRepository.create({
      fullName: createUserDto.fullName,
      email: createUserDto.email,
      jobTitle: createUserDto.jobTitle,
      avatarUrl: createUserDto.avatarUrl,
      mobile: createUserDto.mobile,
      passwordHash,
      role,
    });
    return this.userRepository.save(user);
  }

  async setStatus(id: number, status: UserStatus): Promise<User> {
    await this.findById(id);
    await this.userRepository.update(id, { status });
    if (status === UserStatus.INACTIVE) {
      // Deactivated accounts can no longer use an outstanding refresh token.
      await this.userRepository.update(id, { refreshTokenHash: null });
    }
    return this.findById(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findById(id);
    const { roleId, ...rest } = updateUserDto;
    let role: Role | undefined;
    if (roleId) {
      role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
    }
    await this.userRepository.save({
      id,
      ...rest,
      ...(role ? { role } : {}),
    });
    return this.findById(id);
  }

  async updatePasswordHash(id: number, passwordHash: string): Promise<void> {
    await this.userRepository.update(id, { passwordHash });
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
