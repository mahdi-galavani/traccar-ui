import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // صفحه‌ی لاگین: Server-side رندر می‌شود (عمومی است، نیاز به auth ندارد)
  {
    path: 'auth/login',
    renderMode: RenderMode.Server,
  },
  {
    path: 'auth/logout',
    renderMode: RenderMode.Server,
  },
  // تمام صفحات دیگر: Client-side رندر می‌شوند
  // دلیل: همه پشت authGuard هستند، داده‌شان کاملاً داینامیک است،
  // و SSR آن‌ها نیاز به توکن دارد که در build-time وجود ندارد
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
