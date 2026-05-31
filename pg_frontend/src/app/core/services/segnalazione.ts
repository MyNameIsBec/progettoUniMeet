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
  matricola_studente?: string | null;
  id_docente?: string | null;
  allegato?: string | null;
  note_admin?: string | null;
  studente?: { nome: string; cognome: string; email: string } | null;
  docente?: {nome: string; cognome: string; email: string } | null;
}

@Injectable({ providedIn: 'root'})
export class SegnalazioneService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private get api(): string {
    return `${this.authService.getApiUrl()}/api/segnalazioni`;
  }

  inviaSegnalazione(oggetto: string, descrizione: string, matricola_studente: string, file: File | null): Observable<Segnalazione> {
    const formData = new FormData();
    formData.append('oggetto', oggetto);
    formData.append('descrizione', descrizione);
    formData.append('matricola_studente', matricola_studente);
    if (file) {
      formData.append('allegato', file, file.name);
    }
    return this.http.post<Segnalazione>(this.api, formData);
  }

  getSegnalazioniByStudente(matricola: string): Observable<Segnalazione[]> {
    return this.http.get<Segnalazione[]>(`${this.api}/studente/${matricola}`);
  }

  getAllSegnalazioni(stato?: string): Observable<Segnalazione[]> {
    const params = stato ? `?stato=${stato}` : '';
    return this.http.get<Segnalazione[]>(`${this.api}/admin/all${params}`);
  }

  aggiornaStato(id: string, stato: string, noteAdmin?: string): Observable<Segnalazione> {
    const body: any = { stato };
    if (noteAdmin) body.noteAdmin = noteAdmin;
    return this.http.patch<Segnalazione>(`${this.api}/${id}/stato`, body);
  }

  eliminaSegnalazione(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  inviaSegnalazioneDocente(oggetto: string, descrizione: string, id_docente: string, file: File | null): Observable<Segnalazione> {
    const formData = new FormData();
    formData.append('oggetto', oggetto);
    formData.append('descrizione', descrizione);
    formData.append('id_docente', id_docente);
    if (file) {
      formData.append('allegato', file, file.name);
    }
    return this.http.post<Segnalazione>(`${this.api}/docente`, formData);
  }

  getSegnalazioniByDocente(id_docente: string): Observable<Segnalazione[]> {
    return this.http.get<Segnalazione[]>(`${this.api}/docente/${id_docente}`);
  }
}
