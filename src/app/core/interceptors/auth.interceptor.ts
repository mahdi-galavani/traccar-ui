import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { STORAGE_KEYS } from '../../shared/constants/app.constants';
import { AUTH_HEADER, AUTH_SCHEME } from '../../shared/constants/api-endpoints.constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const token = storage.get<string>(STORAGE_KEYS.TOKEN);

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { [AUTH_HEADER]: `${AUTH_SCHEME} ${token}` },
    }),
  );
};
