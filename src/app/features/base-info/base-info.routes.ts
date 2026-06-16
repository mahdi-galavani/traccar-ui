import { Routes } from '@angular/router';

export const BASE_INFO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/base-info-header-list/base-info-header-list.component').then(
        (m) => m.BaseInfoHeaderListComponent,
      ),
  },
  {
    path: ':headerId/items',
    loadComponent: () =>
      import('./pages/base-info-list/base-info-list.component').then(
        (m) => m.BaseInfoListComponent,
      ),
  },
];
