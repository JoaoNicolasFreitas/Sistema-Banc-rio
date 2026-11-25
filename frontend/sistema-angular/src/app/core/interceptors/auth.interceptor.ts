import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const isAuthEndpoint = req.url.includes('/api/v1/auth/login')
    || req.url.includes('/api/v1/auth/refresh')
    || req.url.includes('/api/v1/auth/recuperar-senha');

  const token = authService.accessToken();
  const cloned = token && !isAuthEndpoint
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshSubject.next(null);

          return authService.refresh().pipe(
            switchMap((res) => {
              isRefreshing = false;
              refreshSubject.next(res.accessToken);
              return next(
                req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } }),
              );
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              authService.clearSession();
              toast.warning('Sua sessão expirou. Faça login novamente.');
              router.navigate(['/login']);
              return throwError(() => refreshErr);
            }),
          );
        }

        return refreshSubject.pipe(
          filter((newToken) => newToken !== null),
          take(1),
          switchMap((newToken) =>
            next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })),
          ),
        );
      }

      if (error.status === 403) {
        toast.error('Você não possui permissão para realizar esta ação.');
      }

      return throwError(() => error);
    }),
  );
};
