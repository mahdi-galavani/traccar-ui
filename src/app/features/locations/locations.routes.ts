import { Routes } from '@angular/router';

export const LOCATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/location-list/location-list.component').then(
        (m) => m.LocationListComponent,
      ),
  },
];
