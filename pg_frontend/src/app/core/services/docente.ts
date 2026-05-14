import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Docente } from "../models/interfacce";
import { AuthService } from './auth';
import { SlotRicevimento } from "../models/interfacce";

@Injectable({
  providedIn: 'root',
})
export class DocenteService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private get api(): string {
    return `${this.authService.getApiUrl()}/api/docenti`;
  }

  getDocentiPerCorso(corsoDiStudi: string): Observable<Docente[]> {
    // Il backend attualmente non ha l'endpoint specifico per corso, usiamo quello generale
    return this.http.get<Docente[]>(this.api);
  }

  getDettagliDocente(id: string): Observable<Docente> {
    return this.http.get<Docente>(`${this.api}/${id}`);
  }

  getSlots(idDocente: string, mese?: string | number): Observable<SlotRicevimento[]> {
    let params = new HttpParams();
    if (mese) params = params.set("mese", mese);
    return this.http.get<SlotRicevimento[]>(`${this.api}/${idDocente}/slots`, { params });
  }

  creaSlot(idDocente: string, slot: Partial<SlotRicevimento>): Observable<SlotRicevimento> {
    return this.http.post<SlotRicevimento>(`${this.api}/${idDocente}/slots`, slot);
  }

  modificaSlot(idDocente: string, idSlot: string, dati: Partial<SlotRicevimento>): Observable<SlotRicevimento> {
    return this.http.put<SlotRicevimento>(`${this.api}/${idDocente}/slots/${idSlot}`, dati);
  }

  eliminaSlot(idDocente: string, idSlot: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${idDocente}/slots/${idSlot}`);
  }

  getStatistiche(idDocente: string): Observable<{ argomenti: { nome: string, conteggio: number }[] }> {
    return this.http.get<any>(`${this.api}/${idDocente}/statistiche`);
  }


}
