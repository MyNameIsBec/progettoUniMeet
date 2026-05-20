import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { environment } from '../../../environments/environment';

export const intercettoreAutenticazione: HttpInterceptorFn = (richiesta, next) => {
  const router = inject(Router);
  const servizioAuth = inject(AuthService);
  const urlBaseApi = environment.apiUrl;

  const tokenAutenticazione = servizioAuth.getToken();
  const eUnPercorsoAssoluto = richiesta.url.startsWith('http://') || richiesta.url.startsWith('https://');
  const urlPulita = richiesta.url.replace(/^\//, ''); // Rimuove lo slash iniziale se presente

  let richiestaModificata = richiesta;

  if (eUnPercorsoAssoluto) {
    if (tokenAutenticazione) {
      richiestaModificata = richiesta.clone({
        setHeaders: { Authorization: `Bearer ${tokenAutenticazione}` }
      });
    }
  } else {
    if (tokenAutenticazione !== null && tokenAutenticazione !== undefined) {
      richiestaModificata = richiesta.clone({
        url: `${urlBaseApi}/${urlPulita}`,
        setHeaders: {
          Authorization: `Bearer ${tokenAutenticazione}`
        }
      });
    } else {
      richiestaModificata = richiesta.clone({
        url: `${urlBaseApi}/${urlPulita}` //richiesta anonima, senza token
      });
    }
  }

  return next(richiestaModificata).pipe(
    catchError((errore: HttpErrorResponse) => {
      if (errore.status === 401) {
        console.error('Sessione scaduta o non autorizzato. Redirect al login...');
        localStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => errore);
    })
  );
};
