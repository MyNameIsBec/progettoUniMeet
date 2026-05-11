import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const httpIntInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const baseUrl = 'http://localhost:5000'; // URL del server

  const token = authService.getToken();
  const isAbsolute = req.url.startsWith('http://') || req.url.startsWith('https://');
  const cleanUrl = req.url.replace(/^\//, ''); // Rimuove lo slash iniziale se presente

  let apiReq = req;

  if (isAbsolute) {
    if (token) {
      apiReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  } else {
    if (token !== null && token !== undefined) {
      apiReq = req.clone({
        url: `${baseUrl}/${cleanUrl}`,
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      apiReq = req.clone({
        url: `${baseUrl}/${cleanUrl}` //richiesta anonima, senza token
      });
    }
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
