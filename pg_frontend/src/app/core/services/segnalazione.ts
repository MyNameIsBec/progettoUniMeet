import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface Segnalazione {
  id_segnalazione: string;
  oggetto: string;
  descrizione: string;
  data_invio: string;
  stato: string;
  matricola_studente: string;
  id_docente?: string;
  studente?: {
    nome: string;
    cognome: string;
    email: string;
  };
  docente?: {
    nome: string;
    cognome: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SegnalazioneService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private get api(): string {
    return `${this.authService.getApiUrl()}/api/segnalazioni`;
  }

  inviaSegnalazione(oggetto: string, descrizione: string, matricola_studente: string): Observable<Segnalazione> {
    return this.http.post<Segnalazione>(this.api, { oggetto, descrizione, matricola_studente });
  }

  getSegnalazioniByStudente(matricola: string): Observable<Segnalazione[]> {
    return this.http.get<Segnalazione[]>(`${this.api}/studente/${matricola}`);
  }

  getAllSegnalazioni(stato?: string): Observable<Segnalazione[]> {
    const params = stato ? `?stato=${stato}` : '';
    return this.http.get<Segnalazione[]>(`${this.api}/admin/all${params}`);
  }

  aggiornaStato(id: string, stato: string): Observable<Segnalazione> {
    return this.http.patch<Segnalazione>(`${this.api}/${id}/stato`, { stato });
  }

  eliminaSegnalazione(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  inviaSegnalazioneDocente(oggetto: string, descrizione: string, id_docente: string): Observable<Segnalazione> {
    return this.http.post<Segnalazione>(`${this.api}/docente`, { oggetto, descrizione, id_docente });
  }

  getSegnalazioniByDocente(id_docente: string): Observable<Segnalazione[]> {
    return this.http.get<Segnalazione[]>(`${this.api}/docente/${id_docente}`);
  }
}
