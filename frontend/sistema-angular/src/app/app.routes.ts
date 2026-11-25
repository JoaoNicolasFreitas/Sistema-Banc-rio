import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        data: { breadcrumb: 'Dashboard' },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'perfil',
        data: { breadcrumb: 'Meu Perfil' },
        loadComponent: () =>
          import('./features/perfil/perfil.component').then((m) => m.PerfilComponent),
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GESTOR'], breadcrumb: 'Usuários' },
        loadComponent: () =>
          import('./features/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
      },
      {
        path: 'cursos',
        data: { breadcrumb: 'Cursos' },
        loadComponent: () =>
          import('./features/cursos/cursos.component').then((m) => m.CursosComponent),
      },
      {
        path: 'disciplinas',
        data: { breadcrumb: 'Disciplinas' },
        loadComponent: () =>
          import('./features/disciplinas/disciplinas.component').then((m) => m.DisciplinasComponent),
      },
      {
        path: 'auditoria',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'], breadcrumb: 'Auditoria' },
        loadComponent: () =>
          import('./features/auditoria/auditoria.component').then((m) => m.AuditoriaComponent),
      },
      {
        path: 'configuracoes',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'], breadcrumb: 'Configurações' },
        loadComponent: () =>
          import('./features/configuracoes/configuracoes.component').then((m) => m.ConfiguracoesComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
