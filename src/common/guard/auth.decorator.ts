// src/common/decorators/auth.decorator.ts
import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guard/auth.guard.js';

export type UserType = 'admin' | 'merchant';

export const PERMISSIONS_KEY = 'permissions';
export const ALLOWED_USERS_KEY = 'allowed_users';

export function Auth(
  permissions: string | string[],
  allow: UserType | UserType[] = 'admin',
) {
  const perms = Array.isArray(permissions) ? permissions : [permissions];
  const users = Array.isArray(allow) ? allow : [allow];

  return applyDecorators(
    SetMetadata(PERMISSIONS_KEY, perms),
    SetMetadata(ALLOWED_USERS_KEY, users),
    UseGuards(AuthGuard),
  );
}