import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { Prenotazione } from '../models/interfacce';

@Injectable({ providedIn: 'root' })
export class PrenotazioneService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  private get api(): string {
    return `${this.authService.getApiUrl()}/api/prenotazioni`;
  }

  createPrenotazione(prenotazione: Partial<Prenotazione> | FormData): Observable<Prenotazione> {
    return this.http.post<Prenotazione>(this.api, prenotazione);
  }

  annullaPrenotazione(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  eliminaPrenotazione(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/fisico`);
  }

  getPrenotazioniStudente(matricolaStudente: string): Observable<Prenotazione[]> {
    return this.http.get<Prenotazione[]>(`${this.api}/studente/${matricolaStudente}`);
  }

  getPrenotazioneById(id: string): Observable<Prenotazione> {
    return this.http.get<Prenotazione>(`${this.api}/${id}`);
  }

  getPrenotazioniDocente(idDocente: string): Observable<Prenotazione[]> {
    return this.http.get<Prenotazione[]>(`${this.api}/docente/${idDocente}`);
  }

  aggiornaStatoPrenotazione(id: string, stato: string): Observable<Prenotazione> {
    const statoUpper = stato.toUpperCase();
    return this.http.put<Prenotazione>(`${this.api}/${id}/stato`, { stato: statoUpper });
  }

  aggiungiDocumenti(id: string, formData: FormData): Observable<Prenotazione> {
    return this.http.post<Prenotazione>(`${this.api}/${id}/documenti`, formData);
  }

  puoAnnullare(dataSlot: string, limiteOre: number = 24): boolean {
    const diff = new Date(dataSlot).getTime() - new Date().getTime();
    return diff > limiteOre * 60 * 60 * 1000;
  }
}
