import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

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
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      {
        path: 'airplanes',
        loadChildren: () =>
          import('./features/airplanes/airplanes.routes').then((m) => m.AIRPLANES_ROUTES),
      },
      {
        path: 'airports',
        loadChildren: () =>
          import('./features/airports/airports.routes').then((m) => m.AIRPORTS_ROUTES),
      },
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
        path: 'fleet-schedule',
        loadChildren: () =>
          import('./features/fleet-schedule/fleet-schedule.routes').then(
            (m) => m.FLEET_SCHEDULE_ROUTES,
          ),
      },
      {
        path: 'fleet-timeline',
        loadComponent: () =>
          import('./features/fleet-timeline/fleet-timeline.component').then(
            (m) => m.FleetTimelineComponent
          ),
      },
      {
        path: 'fleet-timeline-all',
        loadComponent: () =>
          import('./features/fleet-timeline-all/fleet-timeline.component').then(
            (m) => m.FleetTimelineComponent
          ),
      },
      {
        path: 'personnel',
        loadChildren: () =>
          import('./features/personnel/personnel.routes').then((m) => m.PERSONNEL_ROUTES),
      },
      { path: '**', redirectTo: 'users' },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
