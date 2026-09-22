import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const demoPage = () =>
  import('./features/demo/demo-page.component').then((m) => m.DemoPageComponent);

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      { path: 'tracking', loadComponent: demoPage, data: { kind: 'tracking' } },
      { path: 'vehicles', loadComponent: demoPage, data: { kind: 'vehicles' } },
      { path: 'trackers', loadComponent: demoPage, data: { kind: 'trackers' } },
      { path: 'routes', loadComponent: demoPage, data: { kind: 'routes' } },
      { path: 'geofences', loadComponent: demoPage, data: { kind: 'geofences' } },
      { path: 'reports', loadComponent: demoPage, data: { kind: 'reports' } },
      {
        path: 'locations',
        loadChildren: () =>
          import('./features/locations/locations.routes').then((m) => m.LOCATIONS_ROUTES),
      },
      {
        path: 'base-info',
        loadChildren: () =>
          import('./features/base-info/base-info.routes').then((m) => m.BASE_INFO_ROUTES),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'personnel',
        loadChildren: () =>
          import('./features/personnel/personnel.routes').then((m) => m.PERSONNEL_ROUTES),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
