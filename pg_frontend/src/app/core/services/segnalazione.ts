import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SegnalazioneService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  inviaSegnalazione(tipo: string, descrizione: string): Observable<{ messaggio: string }> {
    const userId = this.authService.getCurrentUser()?.id;
    return this.http.post<{ messaggio: string }>(`${this.authService.getApiUrl}/api/segnalazione`, { tipo, descrizione, userId });
  }
}
