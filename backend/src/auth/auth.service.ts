/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User, UserStatus } from '../users/user.entity';
import { MailService } from '../mail/mail.service';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/activity.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const SALT_ROUNDS = 10;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly activitiesService: ActivitiesService,
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
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('This account has been deactivated');
    }
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const tokens = await this.issueTokens(user);
    await this.activitiesService.log({
      userId: user.id,
      type: ActivityType.USER_LOGIN,
      entityType: 'user',
      entityId: user.id,
      description: `${user.fullName} logged in`,
    });
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: number; type?: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findByIdWithRefreshToken(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token not recognized');
    }
    if (this.hashToken(refreshToken) !== user.refreshTokenHash) {
      // Token doesn't match the last-issued hash: treat as possible reuse
      // of a rotated/stale token and revoke the session defensively.
      await this.usersService.setRefreshTokenHash(user.id, null);
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.setRefreshTokenHash(userId, null);
    await this.activitiesService.log({
      userId,
      type: ActivityType.USER_LOGOUT,
      entityType: 'user',
      entityId: userId,
      description: 'logged out',
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
      await this.usersService.setPasswordResetToken(
        user.id,
        this.hashToken(token),
        expiresAt,
      );
      await this.mailService.sendPasswordReset(user.email, token);
    }
    // Same response whether or not the email exists, to avoid leaking which
    // addresses have accounts.
    return {
      message:
        'If an account exists for that email, a reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByValidPasswordResetHash(
      this.hashToken(token),
    );
    if (!user) {
      throw new BadRequestException('Reset link is invalid or has expired');
    }
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.usersService.updatePasswordHash(user.id, newHash);
    await this.usersService.setPasswordResetToken(user.id, null, null);
    await this.usersService.setRefreshTokenHash(user.id, null);
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findById(userId);
    const fullUser = await this.usersService.findByEmailWithPassword(
      user.email,
    );
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
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            permissions: user.role.permissions,
          }
        : null,
    };
  }

  private async issueTokens(user: User): Promise<TokenPair> {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role?.name,
    });
    const refreshToken = this.jwtService.sign(
      // A random jti guarantees each refresh token is unique even when two
      // are issued within the same second (JWT `iat` has 1s resolution),
      // which would otherwise make reuse-detection on rotation a no-op.
      { sub: user.id, type: 'refresh', jti: crypto.randomUUID() },
      {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    );
    await this.usersService.setRefreshTokenHash(
      user.id,
      this.hashToken(refreshToken),
    );
    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
