import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PerfilNome } from '../models/api.models';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const allowedRoles = (route.data?.['roles'] as PerfilNome[] | undefined) ?? [];
  if (allowedRoles.length === 0 || authService.hasRole(allowedRoles)) {
    return true;
  }

  toast.warning('Acesso restrito ao seu perfil de usuário.');
  return router.createUrlTree(['/dashboard']);
};
