/* eslint-disable prettier/prettier */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const granted: string[] = user?.role?.permissions ?? [];
    const missing = required.filter((permission) => !granted.includes(permission));
    if (missing.length > 0) {
      throw new ForbiddenException(
        `Missing required permission(s): ${missing.join(', ')}`,
      );
    }
    return true;
  }
}
