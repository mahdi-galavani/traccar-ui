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
          notification.error('errors.session_expired');
          break;
        case error.status === 403:
          notification.error('errors.forbidden');
          break;
        case error.status === 0:
          notification.error('errors.network_error');
          break;
        case error.status >= 500:
          notification.error('errors.server_error');
          break;
        default:
          notification.error('errors.generic');
      }
      return throwError(() => error);
    }),
  );
};
