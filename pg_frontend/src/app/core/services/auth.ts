import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, BehaviorSubject } from 'rxjs';

export type UserRole = 'studente' | 'docente' | 'amministratore' | 'guest';

export interface UserSession {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface Login2FARequired {
  requires2FA: true;
  email: string;
  nome: string;
  cognome: string;
  role: UserRole;
  tempToken: string;
  codiceMostrato?: string;
}

export interface RegistrazioneStudente {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  matricola: string;
  corsoDiStudi: string;
}

import { CorsoDiStudi } from '../models/interfacce';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<UserSession | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSessionFromStorage();
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  login(email: string, password: string, rememberMe: boolean = false): Observable<UserSession | Login2FARequired> {
    return this.http.post<UserSession | Login2FARequired>(`${this.apiUrl}/api/login`, { email, password }).pipe(
      tap(session => {
        if ('token' in session) {
          session.role = session.role.toLowerCase() as UserRole;
          this.currentUserSubject.next(session);
          this.saveSessionToStorage(session, rememberMe);
        }
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('unimeet_session');
    sessionStorage.removeItem('unimeet_session');
  }

  getCorsiDiStudio(): Observable<CorsoDiStudi[]> {
    return this.http.get<CorsoDiStudi[]>(`${this.apiUrl}/api/corsi-di-studio`);
  }

  registraStudente(dati: RegistrazioneStudente): Observable<UserSession> {
    return this.http.post<UserSession>(`${this.apiUrl}/api/registrazione`, dati).pipe(
      tap(session => {
        session.role = session.role.toLowerCase() as UserRole;
        this.currentUserSubject.next(session);
        this.saveSessionToStorage(session);
      })
    );
  }

  updateUser(data: Partial<UserSession>): void {
    const current = this.currentUserSubject.value;
    if (current) {
      const updated = { ...current, ...data };
      this.currentUserSubject.next(updated);
      this.saveSessionToStorage(updated);
    }
  }

  richiediResetPassword(email: string): Observable<{ messaggio: string }> {
    return this.http.post<{ messaggio: string }>(
      `${this.apiUrl}/api/recupera-password`, { email }
    );
  }

  verificaCodice(email: string, codice: string): Observable<{ valido: boolean }> {
    return this.http.post<{ valido: boolean }>(
      `${this.apiUrl}/api/auth/verifica-codice`,
      { email, codice }
    );
  }

  confermaResetPassword(email: string, codice: string, nuovaPassword: string): Observable<{ messaggio: string }> {
    return this.http.post<{ messaggio: string }>(
      `${this.apiUrl}/api/reset-password`,
      { email, codice, nuovaPassword }
    );
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/auth/profile`);
  }

  changePassword(vecchiaPassword: string, newPassword: string): Observable<{ messaggio: string }> {
    return this.http.post<{ messaggio: string }>(
      `${this.apiUrl}/api/auth/change-password`,
      { vecchiaPassword, newPassword }
    );
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): UserSession | null {
    return this.currentUserSubject.value;
  }

  getRole(): UserRole {
    return this.currentUserSubject.value?.role ?? 'guest';
  }

  hasRole(requiredRole: UserRole): boolean {
    return this.getRole() === requiredRole;
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  verifica2FA(tempToken: string, codice: string): Observable<UserSession> {
    return this.http.post<UserSession>(`${this.apiUrl}/api/auth/verifica-2fa`, { tempToken, codice }).pipe(
      tap(session => {
        session.role = session.role.toLowerCase() as UserRole;
        this.currentUserSubject.next(session);
        this.saveSessionToStorage(session);
      })
    );
  }

  abilita2FA(): Observable<{ messaggio: string; codiceMostrato?: string }> {
    return this.http.post<{ messaggio: string; codiceMostrato?: string }>(
      `${this.apiUrl}/api/auth/2fa/abilita`, {}
    );
  }

  confermaAbilita2FA(codice: string): Observable<{ messaggio: string }> {
    return this.http.post<{ messaggio: string }>(
      `${this.apiUrl}/api/auth/2fa/conferma`, { codice }
    );
  }

  disabilita2FA(password: string): Observable<{ messaggio: string }> {
    return this.http.post<{ messaggio: string }>(
      `${this.apiUrl}/api/auth/2fa/disabilita`, { password }
    );
  }

  getStato2FA(): Observable<{ abilitato: boolean }> {
    return this.http.get<{ abilitato: boolean }>(`${this.apiUrl}/api/auth/2fa/stato`);
  }

  private saveSessionToStorage(session: UserSession, persist?: boolean): void {
    let targetStorage: Storage;
    if (persist !== undefined) {
      targetStorage = persist ? localStorage : sessionStorage;
    } else {
      if (localStorage.getItem('unimeet_session')) {
        targetStorage = localStorage;
      } else if (sessionStorage.getItem('unimeet_session')) {
        targetStorage = sessionStorage;
      } else {
        targetStorage = localStorage; // Default fallback
      }
    }

    if (targetStorage === localStorage) {
      sessionStorage.removeItem('unimeet_session');
    } else {
      localStorage.removeItem('unimeet_session');
    }

    targetStorage.setItem('unimeet_session', JSON.stringify(session));
  }

  private loadSessionFromStorage(): void {
    const raw = localStorage.getItem('unimeet_session') || sessionStorage.getItem('unimeet_session');
    if (raw) {
      try {
        const session = JSON.parse(raw) as UserSession;
        session.role = session.role.toLowerCase() as UserRole;
        this.currentUserSubject.next(session);
      } catch {
        localStorage.removeItem('unimeet_session');
        sessionStorage.removeItem('unimeet_session');
      }
    }
  }
}
