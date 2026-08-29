/* eslint-disable prettier/prettier */
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { ActivitiesService } from '../activities/activities.service';
import { UserStatus } from '../users/user.entity';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let mailService: jest.Mocked<Partial<MailService>>;
  let activitiesService: jest.Mocked<Partial<ActivitiesService>>;

  const activeUser: any = {
    id: 1,
    fullName: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashed',
    status: UserStatus.ACTIVE,
    role: { id: 1, name: 'Developer' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    usersService = {
      findByEmailWithPassword: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByIdWithRefreshToken: jest.fn(),
      findByValidPasswordResetHash: jest.fn(),
      setRefreshTokenHash: jest.fn(),
      setPasswordResetToken: jest.fn(),
      updatePasswordHash: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-token'), verify: jest.fn() };
    mailService = { sendPasswordReset: jest.fn() };
    activitiesService = { log: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
        { provide: ActivitiesService, useValue: activitiesService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('rejects an unknown email', async () => {
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(null);

      await expect(service.validateUser('nobody@example.com', 'x')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects an incorrect password', async () => {
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(activeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(activeUser.email, 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a deactivated account even with the correct password', async () => {
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue({
        ...activeUser,
        status: UserStatus.INACTIVE,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.validateUser(activeUser.email, 'correct')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns the user when credentials are valid and the account is active', async () => {
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(activeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.validateUser(activeUser.email, 'correct')).resolves.toEqual(
        activeUser,
      );
    });
  });

  describe('login', () => {
    it('issues a token pair, stores the refresh hash, and logs a login activity', async () => {
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(activeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: activeUser.email, password: 'correct' });

      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toBe('signed-token');
      expect(result.user.email).toBe(activeUser.email);
      expect(usersService.setRefreshTokenHash).toHaveBeenCalledWith(
        activeUser.id,
        expect.any(String),
      );
      expect(activitiesService.log).toHaveBeenCalledWith(
        expect.objectContaining({ userId: activeUser.id, entityType: 'user' }),
      );
    });
  });

  describe('refresh', () => {
    it('rejects a token that fails JWT verification', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('bad signature');
      });

      await expect(service.refresh('garbage')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a token whose stored hash no longer matches, and revokes it', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: 1, type: 'refresh' });
      (usersService.findByIdWithRefreshToken as jest.Mock).mockResolvedValue({
        ...activeUser,
        refreshTokenHash: 'a-different-hash',
      });

      await expect(service.refresh('stale-token')).rejects.toThrow(UnauthorizedException);
      expect(usersService.setRefreshTokenHash).toHaveBeenCalledWith(activeUser.id, null);
    });

    it('rotates the token pair when the hash matches', async () => {
      const crypto = require('crypto');
      const matchingHash = crypto.createHash('sha256').update('good-token').digest('hex');
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: 1, type: 'refresh' });
      (usersService.findByIdWithRefreshToken as jest.Mock).mockResolvedValue({
        ...activeUser,
        refreshTokenHash: matchingHash,
      });

      const result = await service.refresh('good-token');

      expect(result.accessToken).toBe('signed-token');
    });
  });

  describe('logout', () => {
    it('clears the refresh token hash and logs the event', async () => {
      await service.logout(activeUser.id);

      expect(usersService.setRefreshTokenHash).toHaveBeenCalledWith(activeUser.id, null);
      expect(activitiesService.log).toHaveBeenCalledWith(
        expect.objectContaining({ userId: activeUser.id }),
      );
    });
  });

  describe('forgotPassword', () => {
    it('sends a reset email only when the account exists', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(activeUser);

      await service.forgotPassword(activeUser.email);

      expect(mailService.sendPasswordReset).toHaveBeenCalledWith(
        activeUser.email,
        expect.any(String),
      );
    });

    it('returns the same generic message for an unknown email, without sending mail', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.forgotPassword('nobody@example.com');

      expect(mailService.sendPasswordReset).not.toHaveBeenCalled();
      expect(result.message).toMatch(/if an account exists/i);
    });
  });

  describe('resetPassword', () => {
    it('rejects an invalid or expired token', async () => {
      (usersService.findByValidPasswordResetHash as jest.Mock).mockResolvedValue(null);

      await expect(service.resetPassword('bad-token', 'NewPass123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('updates the password and clears reset/refresh state on success', async () => {
      (usersService.findByValidPasswordResetHash as jest.Mock).mockResolvedValue(activeUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      await service.resetPassword('good-token', 'NewPass123');

      expect(usersService.updatePasswordHash).toHaveBeenCalledWith(activeUser.id, 'new-hash');
      expect(usersService.setPasswordResetToken).toHaveBeenCalledWith(activeUser.id, null, null);
      expect(usersService.setRefreshTokenHash).toHaveBeenCalledWith(activeUser.id, null);
    });
  });

  describe('changePassword', () => {
    it('rejects when the current password is wrong', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue(activeUser);
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(activeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(activeUser.id, {
          currentPassword: 'wrong',
          newPassword: 'NewPass123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('updates the password hash when the current password is correct', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue(activeUser);
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(activeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      await service.changePassword(activeUser.id, {
        currentPassword: 'correct',
        newPassword: 'NewPass123',
      });

      expect(usersService.updatePasswordHash).toHaveBeenCalledWith(activeUser.id, 'new-hash');
    });
  });
});
