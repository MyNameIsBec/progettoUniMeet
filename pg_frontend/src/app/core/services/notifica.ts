import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";

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
  private nonLetteSubject = new BehaviorSubject<number>(0);
  nonLette$ = this.nonLetteSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) { }

  private get api(): string {
    return `${this.authService.getApiUrl()}/api/notifiche`;
  }

  getNotifiche(destinatarioId: string): Observable<Notifica[]> {
    return this.http.get<Notifica[]>(`${this.api}/${destinatarioId}`)
  }

  fetchNonLette(destinatarioId: string): void {
    if (!destinatarioId) return;
    this.http.get<Notifica[]>(`${this.api}/${destinatarioId}`).subscribe({
      next: (notifiche) => {
        this.nonLetteSubject.next(notifiche.filter(n => !n.letta).length);
      },
    });
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
}
