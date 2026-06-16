import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-list/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('./pages/role-list/role-list.component').then((m) => m.RoleListComponent),
  },
];
