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

export interface SlotDate {
  data: string;
  conteggio: number;
}

export interface CreaSlotRequest {
  docenteId: string;
  data: string;
  oraInizio: string;
  oraFine: string;
  disponibilita: boolean;
  luogo: { nomeAula: string; edificio: string; piano: string };
}

export interface GiornoBloccato {
  id: string;
  data: string;
  motivo: string;
  creatoIl: string;
}

export interface PrenotazioneAdmin {
  id: string;
  studente: { matricola: string; nome: string; cognome: string; email: string };
  docente: { id: string; nome: string; cognome: string; email: string };
  slot: { data: string; oraInizio: string; oraFine: string };
  argomento: string;
  descrizione?: string | null;
  stato: string;
  dataPrenotazione: string;
  documentiCount: number;
}

export interface FiltriPrenotazioni {
  stato?: string;
  docenteId?: string;
  data?: string;
}

export interface FiltriSlot {
  docenteId?: string;
  data?: string;
  stato?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) { }

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

  getSlotDate(): Observable<SlotDate[]> {
    return this.http.get<SlotDate[]>('api/admin/slot-date');
  }

  creaSlot(dati: CreaSlotRequest): Observable<SlotGriglia> {
    return this.http.post<SlotGriglia>('api/admin/slot', dati);
  }

  modificaSlot(idSlot: string, dati: Partial<CreaSlotRequest>): Observable<any> {
    return this.http.put(`api/admin/slot/${idSlot}`, dati);
  }

  eliminaSlot(idSlot: string): Observable<void> {
    return this.http.delete<void>(`api/admin/slot/${idSlot}`);
  }

  getGiorniBloccati(): Observable<GiornoBloccato[]> {
    return this.http.get<GiornoBloccato[]>('api/admin/giorni-bloccati');
  }

  bloccaGiorno(dati: { data: string; motivo?: string }): Observable<GiornoBloccato> {
    return this.http.post<GiornoBloccato>('api/admin/giorni-bloccati', dati);
  }

  sbloccaGiorno(id: string): Observable<void> {
    return this.http.delete<void>(`api/admin/giorni-bloccati/${id}`);
  }

  aggiornaStatoPrenotazione(id: string, stato: string): Observable<any> {
    return this.http.put(`api/admin/prenotazioni/${id}/stato`, { stato });
  }

  eliminaPrenotazione(id: string): Observable<void> {
    return this.http.delete<void>(`api/admin/prenotazioni/${id}`);
  }

  getPrenotazioni(filtri?: FiltriPrenotazioni): Observable<PrenotazioneAdmin[]> {
    let params = '';
    if (filtri) {
      const parts: string[] = [];
      if (filtri.stato) parts.push(`stato=${filtri.stato}`);
      if (filtri.docenteId) parts.push(`docenteId=${filtri.docenteId}`);
      if (filtri.data) parts.push(`data=${filtri.data}`);
      if (parts.length) params = `?${parts.join('&')}`;
    }
    return this.http.get<PrenotazioneAdmin[]>(`api/admin/prenotazioni${params}`);
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
