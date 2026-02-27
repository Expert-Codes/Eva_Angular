import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'access/:token', loadComponent: () => import('./pages/employee-access/employee-access.component').then(m => m.EmployeeAccessComponent) },
  { path: '', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'events', canActivate: [authGuard], loadComponent: () => import('./pages/events/events.component').then(m => m.EventsComponent) },
  { path: 'events/:id', canActivate: [authGuard], loadComponent: () => import('./pages/event-detail/event-detail.component').then(m => m.EventDetailComponent) },
  { path: 'employees', canActivate: [authGuard], loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent) },
  { path: 'evaluations', canActivate: [authGuard], loadComponent: () => import('./pages/evaluations/evaluations.component').then(m => m.EvaluationsComponent) },
  { path: 'analytics', canActivate: [authGuard], loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent) },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
