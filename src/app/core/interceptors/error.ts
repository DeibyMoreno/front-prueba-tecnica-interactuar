import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { toApiError } from '../services/api';
import { Toast } from '../services/toast';

/**
 * Traduce errores HTTP (`{ error: { codigo, mensaje, detalles } }`) a toasts amigables.
 * Los 400 de validación se re-lanzan para que el formulario los pinte inline además del toast.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(Toast);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) return throwError(() => err);
      // /health lo maneja el badge del shell sin spam de toasts
      if (req.url.includes('/health')) return throwError(() => toApiError(err));

      const apiError = toApiError(err);
      toast.errorApi(apiError);

      if (apiError.codigo === 'NO_ENCONTRADO' && req.method === 'GET' && req.url.includes('/solicitudes/')) {
        void router.navigate(['/solicitudes']);
      }

      return throwError(() => apiError);
    }),
  );
};
