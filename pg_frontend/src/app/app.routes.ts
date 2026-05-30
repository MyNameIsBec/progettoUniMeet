import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  // --- AUTH ---
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'registrazione',
    loadComponent: () => import('./features/auth/registrazione/registrazione.page').then(m => m.RegistrazionePage)
  },
  {
    path: 'recupera-password',
    loadComponent: () => import('./features/auth/recupera-password/recupera-password.page').then(m => m.RecuperaPasswordPage)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
  },
  {
    path: 'verifica-2fa',
    loadComponent: () => import('./features/auth/verifica-2fa/verifica-2fa.page').then(m => m.Verifica2FAPage)
  },

  // --- STUDENTE ---
  {
    path: 'dashboard-studente',
    canActivate: [authGuard, roleGuard('studente')],
    loadComponent: () => import('./features/studente/dashboard-studente/dashboard-studente.page').then(m => m.DashboardStudentePage)
  },
  {
    path: 'elenco-docenti',
    canActivate: [authGuard, roleGuard('studente')],
    loadComponent: () => import('./features/studente/elenco-docenti/elenco-docenti.page').then(m => m.ElencoDocentiPage)
  },
  {
    path: 'prenota',
    canActivate: [authGuard, roleGuard('studente')],
    loadComponent: () => import('./features/studente/prenota/prenota.page').then(m => m.PrenotaPage)
  },
  {
    path: 'riepilogo-prenotazioni',
    canActivate: [authGuard, roleGuard('studente')],
    loadComponent: () => import('./features/studente/riepilogo-prenotazioni/riepilogo-prenotazioni.page').then(m => m.RiepilogoPrenotazioniPage)
  },
  {
    path: 'dettaglio-prenotazione/:id',
    canActivate: [authGuard, roleGuard('studente')],
    loadComponent: () => import('./features/studente/dettaglio-prenotazione/dettaglio-prenotazione.page').then(m => m.DettaglioPrenotazionePage)
  },
  {
    path: 'profilo-studente',
    canActivate: [authGuard, roleGuard('studente')],
    loadComponent: () => import('./features/studente/profilo-studente/profilo-studente.page').then(m => m.ProfiloStudentePage)
  },
  {
    path: 'bacheca-studente',
    canActivate: [authGuard, roleGuard('studente')],
    loadComponent: () => import('./features/studente/bacheca-studente/bacheca-studente.page').then(m => m.BachecaStudentePage)
  },
  {
    path: 'notifiche-studente',
    canActivate: [authGuard, roleGuard('studente')],
    loadComponent: () => import('./features/studente/notifiche-studente/notifiche-studente.page').then(m => m.NotificheStudentePage)
  },
  {
    path: 'segnalazioni-studente',
    canActivate: [authGuard, roleGuard('studente')],
    loadComponent: () => import('./features/studente/segnalazioni-studente/segnalazioni-studente.page').then(m => m.SegnalazioniStudentePage)
  },

  // --- DOCENTE ---
  {
    path: 'dashboard-docente',
    canActivate: [authGuard, roleGuard('docente')],
    loadComponent: () => import('./features/docente/dashboard-docente/dashboard-docente.page').then(m => m.DashboardDocentePage)
  },
  {
    path: 'gestione-slot',
    canActivate: [authGuard, roleGuard('docente')],
    loadComponent: () => import('./features/docente/gestione-slot/gestione-slot.page').then(m => m.GestioneSlotPage)
  },
  {
    path: 'prenotazioni-ricevute',
    canActivate: [authGuard, roleGuard('docente')],
    loadComponent: () => import('./features/docente/prenotazioni-ricevute/prenotazioni-ricevute.page').then(m => m.PrenotazioniRicevutePage)
  },
  {
    path: 'dettaglio-prenotazione-docente/:id',
    canActivate: [authGuard, roleGuard('docente')],
    loadComponent: () => import('./features/docente/dettaglio-prenotazione-docente/dettaglio-prenotazione-docente.page').then(m => m.DettaglioPrenotazioneDocentePage)
  },
  {
    path: 'bacheche-docente',
    canActivate: [authGuard, roleGuard('docente')],
    loadComponent: () => import('./features/docente/bacheche-docente/bacheche-docente.page').then(m => m.BachecheDocentePage)
  },
  {
    path: 'notifiche-docente',
    canActivate: [authGuard, roleGuard('docente')],
    loadComponent: () => import('./features/docente/notifiche-docente/notifiche-docente.page').then(m => m.NotificheDocentePage)
  },
  {
    path: 'statistiche-docente',
    canActivate: [authGuard, roleGuard('docente')],
    loadComponent: () => import('./features/docente/statistiche-docente/statistiche-docente.page').then(m => m.StatisticheDocentePage)
  },
  {
    path: 'profilo-docente',
    canActivate: [authGuard, roleGuard('docente')],
    loadComponent: () => import('./features/docente/profilo-docente/profilo-docente.page').then(m => m.ProfiloDocentePage)
  },
  {
    path: 'documenti-docente',
    canActivate: [authGuard, roleGuard('docente')],
    loadComponent: () => import('./features/docente/documenti-docente/documenti-docente.page').then(m => m.DocumentiDocentePage)
  },
  {
    path: 'segnalazioni-docente',
    canActivate: [authGuard, roleGuard('docente')],
    loadComponent: () => import('./features/docente/segnalazioni-docente/segnalazioni-docente.page').then(m => m.SegnalazioniDocentePage)
  },

  // --- ADMIN ---
  {
    path: 'dashboard-admin',
    canActivate: [authGuard, roleGuard('amministratore')],
    loadComponent: () => import('./features/admin/dashboard-admin/dashboard-admin.page').then(m => m.DashboardAdminPage),
  },
  {
    path: 'gestione-account',
    canActivate: [authGuard, roleGuard('amministratore')],
    loadComponent: () => import('./features/admin/gestione-account/gestione-account.page').then(m => m.GestioneAccountPage),
  },
  {
    path: 'gestione-slot-admin',
    canActivate: [authGuard, roleGuard('amministratore')],
    loadComponent: () => import('./features/admin/gestione-slot-admin/gestione-slot-admin.page').then(m => m.GestioneSlotAdminPage),
  },
  {
    path: 'gestione-segnalazioni',
    canActivate: [authGuard, roleGuard('amministratore')],
    loadComponent: () => import('./features/admin/gestione-segnalazioni/gestione-segnalazioni.page').then(m => m.GestioneSegnalazioniPage),
  },
  {
    path: 'gestione-prenotazioni-admin',
    canActivate: [authGuard, roleGuard('amministratore')],
    loadComponent: () => import('./features/admin/gestione-prenotazioni-admin/gestione-prenotazioni-admin.page').then(m => m.GestionePrenotazioniAdminPage),
  },
  {
    path: 'gestione-calendario',
    canActivate: [authGuard, roleGuard('amministratore')],
    loadComponent: () => import('./features/admin/gestione-calendario/gestione-calendario.page').then(m => m.GestioneCalendarioPage),
  },

  // --- LANDING ---
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.page').then(m => m.HomePage)
  },

  // --- WILDCARD ---
  {
    path: '**',
    redirectTo: 'home'
  }
];
