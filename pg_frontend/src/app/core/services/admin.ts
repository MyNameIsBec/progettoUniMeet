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

export interface UtenteUnificato {
  id: string;
  ruolo: string;
  nome: string;
  cognome: string;
  email: string;
  matricola?: string;
  corsoDiStudi?: string;
  ufficio?: string;
}

export interface CreaUtenteRequest {
  ruolo: string;
  nome: string;
  cognome?: string;
  email: string;
  password: string;
  matricola?: string;
  corsoDiStudi?: string;
  ufficio?: string;
}

export interface SlotGriglia {
  id: string;
  docente: { id: string; nome: string; cognome: string; email: string };
  data: string;
  oraInizio: string;
  oraFine: string;
  disponibilita: boolean;
  luogo?: { nomeAula: string; edificio: string; piano: string } | null;
  prenotazioniCount: number;
}

export interface FiltriSlot {
  docenteId?: string;
  data?: string;
  stato?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Admin {
  constructor(private http: HttpClient) {}

  getStatistiche(): Observable<AdminStats> {
    return this.http.get<AdminStats>('api/admin/stats');
  }

  getUtenti(ruolo?: string): Observable<UtenteUnificato[]> {
    const params = ruolo ? `?ruolo=${ruolo}` : '';
    return this.http.get<UtenteUnificato[]>(`api/admin/utenti${params}`);
  }

  creaUtente(dati: CreaUtenteRequest): Observable<UtenteUnificato> {
    return this.http.post<UtenteUnificato>('api/admin/utenti', dati);
  }

  modificaUtente(id: string, dati: Partial<CreaUtenteRequest>): Observable<UtenteUnificato> {
    return this.http.put<UtenteUnificato>(`api/admin/utenti/${id}`, dati);
  }

  eliminaUtente(id: string): Observable<void> {
    return this.http.delete<void>(`api/admin/utenti/${id}`);
  }

  getSlotGlobali(filtri?: FiltriSlot): Observable<SlotGriglia[]> {
    let params = '';
    if (filtri) {
      const parts: string[] = [];
      if (filtri.docenteId) parts.push(`docenteId=${filtri.docenteId}`);
      if (filtri.data) parts.push(`data=${filtri.data}`);
      if (filtri.stato) parts.push(`stato=${filtri.stato}`);
      if (parts.length) params = `?${parts.join('&')}`;
    }
    return this.http.get<SlotGriglia[]>(`api/admin/slot${params}`);
  }
}
