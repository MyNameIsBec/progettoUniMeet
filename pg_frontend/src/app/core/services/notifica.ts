import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, interval, switchMap, startWith } from "rxjs";
export interface Notifica {
  id: string;
  tipo: 'reminder' | 'sistema' | 'annullamento';
  dataInvio: string;
  messaggio: string;
  letta: boolean;
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

  segnaComeLetta(id: number): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/letta`, null)
  }

  interrogaServer(matricola: string): Observable<Notifica[]> {
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getNotifiche(matricola))
    )
  }

}
