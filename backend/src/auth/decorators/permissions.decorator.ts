/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Gates a route on entries in the current user's Role.permissions array,
 * rather than a hard-coded role name — permissions stay admin-configurable
 * via the Roles module.
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
