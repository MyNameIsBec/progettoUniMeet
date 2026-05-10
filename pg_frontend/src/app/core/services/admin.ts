import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminStats {
  totaleStudenti: number;
  totaleDocenti: number;
  totalePrenotazioni: number;
  slotAttivi: number;
  prenotazioniOggi: number;
}

@Injectable({
  providedIn: 'root',
})
export class Admin {
  constructor(private http: HttpClient) {}

  getStatistiche(): Observable<AdminStats> {
    return this.http.get<AdminStats>('api/admin/stats');
  }
}
