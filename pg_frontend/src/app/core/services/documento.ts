import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
import { Observable } from 'rxjs';
import { Documento } from '../models/interfacce';

@Injectable({ providedIn: 'root' })
export class DocumentoService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private get api(): string {
    return `${this.authService.getApiUrl}/api/documenti`;
  }

  caricaDocumento(idPrenotazione: string, file: File): Observable<Documento> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append("idPrenotazione", idPrenotazione);
    return this.http.post<Documento>(`${this.api}/caricamento`, formData)
  }

  eliminaDocumento(idDocumento: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${idDocumento}`)
  }

  ottieniDaPrenotazione(idPrenotazione: string): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.api}/prenotazione/${idPrenotazione}`)
  }

  ottieniDaCorso(idCorso: string): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.api}/corso/${idCorso}`)
  }
}
