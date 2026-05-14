import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
import { Observable } from 'rxjs';
import { Corso, Studente } from "../models/interfacce";

@Injectable({
  providedIn: 'root',
})
export class StudenteService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  private get api(): string {
    return `${this.authService.getApiUrl()}/api/studenti`;
  }

  getProfilo(matricola: string): Observable<Studente> {
    return this.http.get<Studente>(`${this.api}/${matricola}`);
  }

  aggiornaProfilo(matricola: string, dati: Partial<Studente>): Observable<{ messaggio: string }> {
    return this.http.put<{ messaggio: string }>(`${this.api}/${matricola}`, dati);
  }

  getCorsi(matricola: string): Observable<Corso[]> {
    return this.http.get<Corso[]>(`${this.api}/${matricola}/corsi`);
  }

  cambiaPassword(matricola: string, vecchiaPw: string, nuovaPw: string): Observable<{ messaggio: string }> {
    return this.http.post<{ messaggio: string }>(`${this.api}/${matricola}/cambia-password`, { vecchiaPw, nuovaPw });
  }

  eliminaAccount(matricola: string): Observable<{ messaggio: string }> {
    return this.http.delete<{ messaggio: string }>(`${this.api}/${matricola}`);
  }
}
