import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const roleGuard: (requiredRole: UserRole) => CanActivateFn = 
  (requiredRole) => () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.hasRole(requiredRole) ? true : router.createUrlTree(['/unauthorized']); //  accesso negato
  };