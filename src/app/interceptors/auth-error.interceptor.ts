import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor para manejar errores de autenticación y entidades no encontradas
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Verificar si es el error específico: entity not found
      if (error.error?.status === 'error' && 
          error.error?.data === 'Requested entity was not found.') {
        console.warn('Entity not found error detected, redirecting to login');
        
        // Limpiar token
        localStorage.removeItem('moo_auth_token');
        
        // Redirigir al login
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
