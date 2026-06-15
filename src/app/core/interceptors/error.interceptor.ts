import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { StorageService } from '../services/storage.service';
import { STORAGE_KEYS } from '../../shared/constants/app.constants';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const storage = inject(StorageService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (true) {
        case error.status === 401:
          storage.remove(STORAGE_KEYS.TOKEN);
          storage.remove(STORAGE_KEYS.USER);
          router.navigate(['/auth/login']);
          notification.error('ERRORS.SESSION_EXPIRED');
          break;
        case error.status === 403:
          notification.error('ERRORS.FORBIDDEN');
          break;
        case error.status === 0:
          notification.error('ERRORS.NETWORK_ERROR');
          break;
        case error.status >= 500:
          notification.error('ERRORS.SERVER_ERROR');
          break;
        default:
          notification.error('ERRORS.GENERIC');
      }
      return throwError(() => error);
    }),
  );
};
