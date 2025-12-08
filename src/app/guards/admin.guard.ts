import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AdminModeService } from '../services/admin-mode.service';
import { map } from 'rxjs/operators';

/**
 * Guard para proteger rutas de admin
 * Solo permite acceso si el usuario está en modo admin
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const adminModeService = inject(AdminModeService);
  const router = inject(Router);

  return adminModeService.getAdminModeStatus().pipe(
    map(isAdminMode => {
      if (isAdminMode) {
        // Usuario está en modo admin, permitir acceso
        return true;
      } else {
        // Usuario NO está en modo admin, redirigir a home
        console.warn('Access denied: Admin mode required. Redirecting to /home');
        router.navigate(['/home']);
        return false;
      }
    })
  );
};

/**
 * Guard para proteger rutas de usuario normal
 * Solo permite acceso si el usuario NO está en modo admin
 */
export const userGuard: CanActivateFn = (route, state) => {
  const adminModeService = inject(AdminModeService);
  const router = inject(Router);

  return adminModeService.getAdminModeStatus().pipe(
    map(isAdminMode => {
      if (!isAdminMode) {
        // Usuario está en modo normal, permitir acceso
        return true;
      } else {
        // Usuario está en modo admin, redirigir a admin
        console.warn('Access denied: User mode required. Redirecting to /admin');
        router.navigate(['/admin']);
        return false;
      }
    })
  );
};
