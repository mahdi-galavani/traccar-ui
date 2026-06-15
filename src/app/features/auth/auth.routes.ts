import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'logout',
    loadComponent: () => import('./pages/logout/logout.component').then((m) => m.LogoutComponent),
  },
];
