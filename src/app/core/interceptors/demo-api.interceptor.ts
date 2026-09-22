import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { defer, delay, of, throwError } from 'rxjs';
import { DemoDataService } from '../services/demo-data.service';

/**
 * Browser-only demo backend. It keeps the real HttpClient contract intact,
 * but answers /api requests from a local, persistent in-memory data store.
 */
export const demoApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);

  const demo = inject(DemoDataService);
  const path = new URL(req.urlWithParams, 'http://demo.local').pathname
    .split('/')
    .filter(Boolean);

  const resource = path[1];
  const action = path[2];
  const id = path[3];

  return defer(() => {
    try {
      if (resource === 'auth' && action === 'login' && req.method === 'POST') {
        const body = req.body as { username?: string; password?: string } | null;
        if (!body?.username || !body.password) return failure(401, 'Credentials are required');
        return success({ access_token: 'demo-token', expires_in: 86400 });
      }

      if (resource === 'auth' && action === 'logout') return success(null);

      if (resource === 'location' && action === 'load' && id === 'root') {
        return success(demo.list<any>('location').filter((item) => !item.parent?.id));
      }

      if (resource === 'location' && action === 'load' && id === 'parent') {
        const parentId = path[4];
        return success(demo.list<any>('location').filter((item) => String(item.parent?.id) === parentId));
      }

      if (resource === 'app-user-role' && action === 'load-by-user') {
        const userId = id;
        return success(demo.find('app-user-role', userId) ?? { id: userId, version: 1, roles: [] });
      }

      if (action === 'load' && req.method === 'GET') {
        return success(id ? demo.find(resource, id) ?? null : demo.list(resource));
      }

      if (action === 'save' && req.method === 'POST') {
        return success(demo.save(resource, req.body ?? {}));
      }

      if (action === 'delete' && req.method === 'DELETE') {
        demo.delete(resource, id);
        return success(null);
      }

      return success([]);
    } catch (error) {
      return failure(500, error instanceof Error ? error.message : 'Demo request failed');
    }
  }).pipe(delay(120));
};

function success<T>(body: T) {
  return of(new HttpResponse<T>({ status: 200, body }));
}

function failure(status: number, message: string) {
  return throwError(() => new HttpErrorResponse({ status, statusText: message, error: { message } }));
}
