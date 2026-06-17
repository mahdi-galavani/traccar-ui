import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  console.log('[loading] start:', req.method, req.url);
  loading.show();
  return next(req).pipe(
    finalize(() => {
      console.log('[loading] end:', req.method, req.url);
      loading.hide();
    }),
  );
};
