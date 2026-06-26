import { Routes } from '@angular/router';

export const PERSONNEL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/personnel-list/personnel-list.component').then(
        (m) => m.PersonnelListComponent,
      ),
  },
];
