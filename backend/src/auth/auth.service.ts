/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role?.name,
    });
    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findById(userId);
    const fullUser = await this.usersService.findByEmailWithPassword(user.email);
    const passwordMatches = await bcrypt.compare(
      dto.currentPassword,
      fullUser.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const newHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.usersService.updatePasswordHash(userId, newHash);
  }

  sanitizeUser(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      jobTitle: user.jobTitle,
      avatarUrl: user.avatarUrl,
      role: user.role ? { id: user.role.id, name: user.role.name } : null,
    };
  }
}
