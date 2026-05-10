import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const httpIntInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const baseUrl = 'http://localhost:5000';

  const token = authService.getToken();

  const isAbsolute = req.url.startsWith('http://') || req.url.startsWith('https://');
  const cleanUrl = isAbsolute ? req.url : `${baseUrl}/${req.url.replace(/^\//, '')}`;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const apiReq = req.clone({ url: cleanUrl, setHeaders: headers });

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
