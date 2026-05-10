import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const httpIntInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const baseUrl = 'https://localhost:5000';

  const token = authService.getToken();
  let apiReq = req;

  if (token != null) {
    apiReq = req.clone({
      url: `${baseUrl}/${req.url}`,
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    apiReq = req.clone({ url: `${baseUrl}/${req.url}` });
  }

  return next(apiReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        console.error('Sessione scaduta o non autorizzato. Redirect al login...');
        localStorage.clear();
        router.navigate(['/login']);
      }

      return throwError(() => err);
    })
  );
};