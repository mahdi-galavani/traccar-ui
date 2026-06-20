import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'base-info/:headerId/items',
    renderMode: RenderMode.Server
  },
  {
    path: 'fleet-schedule/edit/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'auth/**',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
