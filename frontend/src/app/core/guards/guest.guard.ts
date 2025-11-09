import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');

  // If a token already exists, redirect to the lists page
  if (token) {
    router.navigate(['/lists']);
    return false;
  }

  // Allow access for guests
  return true;
};
