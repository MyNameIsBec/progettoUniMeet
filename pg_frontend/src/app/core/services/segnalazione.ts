import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth';
import { Observable } from 'rxjs';

export interface Segnalazione {
  id_segnalazione: string;
  oggetto: string;
  descrizione: string;
  data_invio: string;
  stato: string;
  matricola_studente: string;
}

@Injectable({
  providedIn: 'root',
})
export class SegnalazioneService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  private get api(): string {
    return `${this.authService.getApiUrl()}/api/segnalazioni`;
  }

  inviaSegnalazione(oggetto: string, descrizione: string, matricola_studente: string): Observable<Segnalazione> {
    return this.http.post<Segnalazione>(`${this.api}`, { oggetto, descrizione, matricola_studente });
  }

  getSegnalazioniByStudente(matricola: string): Observable<Segnalazione[]> {
    return this.http.get<Segnalazione[]>(`${this.api}/studente/${matricola}`);
  }

  getAllSegnalazioni(): Observable<Segnalazione[]> {
    return this.http.get<Segnalazione[]>(`${this.api}/admin/all`);
  }

  aggiornaStato(id: string, stato: string): Observable<Segnalazione> {
    return this.http.patch<Segnalazione>(`${this.api}/${id}/stato`, { stato });
  }
}
