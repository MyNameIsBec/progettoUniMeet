import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Segnalazione {
  id_segnalazione: string;
  oggetto: string;
  descrizione: string;
  data_invio: string;
  stato: string;
  matricola_studente: string;
  studente?: {
    nome: string;
    cognome: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SegnalazioneService {
  constructor(private http: HttpClient) {}

  inviaSegnalazione(oggetto: string, descrizione: string, matricola_studente: string): Observable<Segnalazione> {
    return this.http.post<Segnalazione>('api/segnalazioni', { oggetto, descrizione, matricola_studente });
  }

  getSegnalazioniByStudente(matricola: string): Observable<Segnalazione[]> {
    return this.http.get<Segnalazione[]>(`api/segnalazioni/studente/${matricola}`);
  }

  getAllSegnalazioni(stato?: string): Observable<Segnalazione[]> {
    const params = stato ? `?stato=${stato}` : '';
    return this.http.get<Segnalazione[]>(`api/segnalazioni/admin/all${params}`);
  }

  aggiornaStato(id: string, stato: string): Observable<Segnalazione> {
    return this.http.patch<Segnalazione>(`api/segnalazioni/${id}/stato`, { stato });
  }
}
