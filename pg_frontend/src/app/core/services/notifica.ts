import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, interval, switchMap, startWith } from "rxjs";

export interface Notifica {
  id: string;
  titolo: string;
  messaggio: string;
  dataInvio: string;
  tipo: string;
  letta: boolean;
  destinatarioId: string;
  destinatarioRuolo: string;
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

  getNotifiche(destinatarioId: string): Observable<Notifica[]> {
    return this.http.get<Notifica[]>(`${this.api}/${destinatarioId}`)
  }

  segnaComeLetta(id: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/letta`, {})
  }

  segnaTutteComeLette(destinatarioId: string): Observable<void> {
    return this.http.post<void>(`${this.api}/${destinatarioId}/letta-tutte`, {})
  }

  cancellaNotificheLette(destinatarioId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${destinatarioId}/lette`)
  }

  interrogaServer(destinatarioId: string): Observable<Notifica[]> {
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getNotifiche(destinatarioId))
    )
  }

}
