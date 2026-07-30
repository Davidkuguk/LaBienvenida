import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';

export const routes: Routes = [
  {
    path: 'admin',
    component: Dashboard,
    title: 'Administración · La Bienvenida',
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'admin',
  },
  {
    path: '**',
    redirectTo: 'admin',
  },
];
