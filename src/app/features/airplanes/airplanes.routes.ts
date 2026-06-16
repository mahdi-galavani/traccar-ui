import { Routes } from '@angular/router';

export const AIRPLANES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/airplane-list/airplane-list.component').then(
        (m) => m.AirplaneListComponent,
      ),
  },
];
