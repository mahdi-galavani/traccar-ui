import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { STORAGE_KEYS } from '../../shared/constants/app.constants';

export const authGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const router = inject(Router);

  const token = storage.get<string>(STORAGE_KEYS.TOKEN);
  return token ? true : router.createUrlTree(['/auth/login']);
};
