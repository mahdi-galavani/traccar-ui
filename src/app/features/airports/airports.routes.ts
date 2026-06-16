import { Routes } from '@angular/router';

export const AIRPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/airport-list/airport-list.component').then((m) => m.AirportListComponent),
  },
];
