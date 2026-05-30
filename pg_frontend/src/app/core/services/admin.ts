import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface AdminStats {
  totaleStudenti: number;
  totaleDocenti: number;
  totalePrenotazioni: number;
  slotAttivi: number;
  prenotazioniOggi: number;
}

export interface ProfiloAccount {
  id: string;
  ruolo: string;
  nome: string;
  cognome: string;
  email: string;
  matricola?: string;
  corsoDiStudi?: string;
  corsoDiStudiId?: string;
  ufficio?: string;
  corsi?: { id: string; nome: string }[];
}

export interface CreaAccountRequest {
  ruolo: string;
  nome: string;
  cognome?: string;
  email: string;
  password: string;
  matricola?: string;
  corsoDiStudi?: string;
  corsi?: string[];
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
  inviaNotifica?: boolean;
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

export interface CorsoListItem {
  id: string;
  nomeCorso: string;
  anno: number;
  cfu: number;
  idDocente: string;
  corsoDiStudiId?: string;
  corsoDiStudiNome?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  private get api(): string {
    return `${this.authService.getApiUrl()}/api/admin`;
  }

  getStatistiche(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.api}/stats`);
  }

  getAccount(ruolo?: string): Observable<ProfiloAccount[]> {
    const params = ruolo ? `?ruolo=${ruolo}` : '';
    return this.http.get<ProfiloAccount[]>(`${this.api}/utenti${params}`);
  }

  creaAccount(dati: CreaAccountRequest): Observable<ProfiloAccount> {
    return this.http.post<ProfiloAccount>(`${this.api}/utenti`, dati);
  }

  modificaAccount(id: string, dati: Partial<CreaAccountRequest>): Observable<ProfiloAccount> {
    return this.http.put<ProfiloAccount>(`${this.api}/utenti/${id}`, dati);
  }

  eliminaAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/utenti/${id}`);
  }

  getSlotDate(): Observable<SlotDate[]> {
    return this.http.get<SlotDate[]>(`${this.api}/slot-date`);
  }

  creaSlot(dati: CreaSlotRequest): Observable<SlotGriglia> {
    return this.http.post<SlotGriglia>(`${this.api}/slot`, dati);
  }

  modificaSlot(idSlot: string, dati: Partial<CreaSlotRequest>): Observable<any> {
    return this.http.put(`${this.api}/slot/${idSlot}`, dati);
  }

  eliminaSlot(idSlot: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/slot/${idSlot}`);
  }

  getGiorniBloccati(): Observable<GiornoBloccato[]> {
    return this.http.get<GiornoBloccato[]>(`${this.api}/giorni-bloccati`);
  }

  bloccaGiorno(dati: { data: string; motivo?: string }): Observable<GiornoBloccato> {
    return this.http.post<GiornoBloccato>(`${this.api}/giorni-bloccati`, dati);
  }

  sbloccaGiorno(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/giorni-bloccati/${id}`);
  }

  aggiornaStatoPrenotazione(id: string, stato: string): Observable<any> {
    return this.http.put(`${this.api}/prenotazioni/${id}/stato`, { stato });
  }

  eliminaPrenotazione(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/prenotazioni/${id}`);
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
    return this.http.get<PrenotazioneAdmin[]>(`${this.api}/prenotazioni${params}`);
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
    return this.http.get<SlotGriglia[]>(`${this.api}/slot${params}`);
  }

  getCorsi(corsoDiStudiId?: string): Observable<CorsoListItem[]> {
    const params = corsoDiStudiId ? `?corsoDiStudiId=${corsoDiStudiId}` : '';
    return this.http.get<CorsoListItem[]>(`${this.authService.getApiUrl()}/api/corsi${params}`);
  }
}
