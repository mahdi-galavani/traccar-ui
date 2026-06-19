import { Routes } from '@angular/router';

export const FLEET_SCHEDULE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/schedule-list/schedule-list.component').then(
        (m) => m.ScheduleListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/schedule-form/schedule-form.component').then(
        (m) => m.ScheduleFormComponent,
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/schedule-form/schedule-form.component').then(
        (m) => m.ScheduleFormComponent,
      ),
  },
];
