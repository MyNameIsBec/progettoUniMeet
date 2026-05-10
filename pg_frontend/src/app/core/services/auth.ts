import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap} from 'rxjs';

export type UserRole = 'studente' | 'docente' | 'amministratore' | 'guest';

export interface UserSession {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface RegistrazioneStudente {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  matricola: string;
  corsoDiStudi: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '';
  private currentUser: UserSession | null = null;

  constructor(private http: HttpClient) {
    this.loadSessionFromStorage();
  }

  setURL(ip: string): void {
    this.apiUrl = `http://${ip}:5000`;
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  login(email: string, password: string): Observable<UserSession> {
    return this.http.post<UserSession>(
      `${this.apiUrl}/api/login`,
      { email, password }
    ).pipe(
      tap(session => {
        this.currentUser = session;
        this.saveSessionToStorage(session);
      })
    );
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('unimeet_session');
  }

  registraStudente(dati: RegistrazioneStudente): Observable<{ messaggio: string }> {
    return this.http.post<{ messaggio: string }>(
      `${this.apiUrl}/api/registrazione`,
      dati
    );
  }

  richiediResetPassword(email: string): Observable<{ messaggio: string }> {
    return this.http.post<{ messaggio: string }>(
      `${this.apiUrl}/api/recupera-password`,
      { email }
    );
  }

  confermaResetPassword(token: string, nuovaPassword: string): Observable<{ messaggio: string }> {
    return this.http.post<{ messaggio: string }>(
      `${this.apiUrl}/api/reset-password`,
      { token, nuovaPassword }
    );
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): UserSession | null {
    return this.currentUser;
  }

  getRole(): UserRole {
    return this.currentUser?.role ?? 'guest';
  }

  hasRole(requiredRole: UserRole): boolean {
    return this.getRole() === requiredRole;
  }

  getToken(): string | null {
    return this.currentUser?.token ?? null;
  }

  isStudente(): boolean { return this.hasRole('studente'); }
  isDocente(): boolean  { return this.hasRole('docente'); }
  isAdmin(): boolean    { return this.hasRole('amministratore'); }

  private saveSessionToStorage(session: UserSession): void {
    localStorage.setItem('unimeet_session', JSON.stringify(session));
  }

  private loadSessionFromStorage(): void {
    const raw = localStorage.getItem('unimeet_session');
    if (raw) {
      try {
        this.currentUser = JSON.parse(raw) as UserSession;
      } catch {
        localStorage.removeItem('unimeet_session');
      }
    }
  }
}
