/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { id: 'ASC' } });
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

  async setRefreshTokenHash(id: number, refreshTokenHash: string | null): Promise<void> {
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
      throw new NotFoundException(`Role with ID ${createUserDto.roleId} not found`);
    }
    const passwordHash = await bcrypt.hash(createUserDto.password, SALT_ROUNDS);
    const user = this.userRepository.create({
      fullName: createUserDto.fullName,
      email: createUserDto.email,
      jobTitle: createUserDto.jobTitle,
      avatarUrl: createUserDto.avatarUrl,
      passwordHash,
      role,
    });
    return this.userRepository.save(user);
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
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
