import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/pages/listar-usuarios/listar-usuarios').then(
            (m) => m.ListarUsuarios
          ),
      },
      {
        path: 'usuarios/novo',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/usuarios/pages/cadastrar-usuario/cadastrar-usuario').then(
            (m) => m.CadastrarUsuario
          ),
      },
      {
        path: 'usuarios/:id/editar',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/usuarios/pages/editar-usuario/editar-usuario').then(
            (m) => m.EditarUsuario
          ),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/pedidos/pages/listar-pedidos/listar-pedidos').then(
            (m) => m.ListarPedidos
          ),
      },
      {
        path: 'pedidos/novo',
        loadComponent: () =>
          import('./features/pedidos/pages/cadastrar-pedido/cadastrar-pedido').then(
            (m) => m.CadastrarPedido
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
