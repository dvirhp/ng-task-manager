import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();

  // If token exists, allow access
  if (token) return true;

  // If there is no token, redirect to login page
  router.navigate(['/auth/login']);
  return false;
};
