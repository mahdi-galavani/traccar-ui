import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { STORAGE_KEYS } from '../../shared/constants/app.constants';
import { UserTokenDto } from '../models/auth.model';

/**
 * Usage: { path: 'users', data: { authority: 'USER_MANAGE' }, canActivate: [roleGuard] }
 */
export const roleGuard: CanActivateFn = (route) => {
  const storage = inject(StorageService);
  const router = inject(Router);

  const requiredAuthority = route.data?.['authority'] as string | undefined;
  if (!requiredAuthority) {
    return true;
  }

  const user = storage.get<UserTokenDto>(STORAGE_KEYS.USER);
  const hasAccess = (user?.authorities ?? []).some(
    (menu) => menu.authority === requiredAuthority,
  );

  return hasAccess ? true : router.createUrlTree(['/dashboard']);
};
