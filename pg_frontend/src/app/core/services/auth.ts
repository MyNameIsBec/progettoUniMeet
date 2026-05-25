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

export interface RegistrazioneStudente {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  matricola: string;
  corsoDiStudi: string;
}

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<UserSession | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSessionFromStorage();
  }

  setURL(ip: string): void {
    this.apiUrl = `http://${ip}:5000`;
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  login(email: string, password: string, rememberMe: boolean = false): Observable<UserSession> {
    return this.http.post<UserSession>(`${this.apiUrl}/api/login`, { email, password }).pipe(
      tap(session => {
        session.role = session.role.toLowerCase() as UserRole;
        this.currentUserSubject.next(session);
        this.saveSessionToStorage(session, rememberMe);
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('unimeet_session');
    sessionStorage.removeItem('unimeet_session');
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

  isStudente(): boolean { return this.hasRole('studente'); }
  isDocente(): boolean { return this.hasRole('docente'); }
  isAdmin(): boolean { return this.hasRole('amministratore'); }

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
