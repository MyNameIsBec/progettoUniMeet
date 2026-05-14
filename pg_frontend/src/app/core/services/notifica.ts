import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, interval, switchMap, startWith } from "rxjs";

export interface Notifica {
  id: string;
  titolo: string;
  messaggio: string;
  data_invio: string;
  tipo: string;
  letta: boolean;
  matricola_studente: string;
}
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class NotificaService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  private get api(): string {
    return `${this.authService.getApiUrl()}/api/notifiche`;
  }

  getNotifiche(matricola: string): Observable<Notifica[]> {
    return this.http.get<Notifica[]>(`${this.api}/${matricola}`)
  }

  segnaComeLetta(id: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/letta`, {})
  }

  segnaTutteComeLette(matricola: string): Observable<void> {
    return this.http.post<void>(`${this.api}/${matricola}/letta-tutte`, {})
  }

  cancellaNotificheLette(matricola: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${matricola}/lette`)
  }

  interrogaServer(matricola: string): Observable<Notifica[]> {
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getNotifiche(matricola))
    )
  }

}
