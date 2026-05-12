import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    //redirectTo: 'home',
    redirectTo: 'dashboard-studente',
    pathMatch: 'full',
  },
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
    path: 'dashboard-studente',
    //canActivate: [authGuard, roleGuard('studente')],
    loadComponent: () => import('./features/studente/dashboard-studente/dashboard-studente.page').then(m => m.DashboardStudentePage),
    children: [
      {
        path: 'elenco-docenti',
        loadComponent: () => import('./features/studente/elenco-docenti/elenco-docenti.page').then(m => m.ElencoDocentiPage)
      },
      {
        path: 'prenota',
        loadComponent: () => import('./features/studente/prenota/prenota.page').then(m => m.PrenotaPage)
      },
      {
        path: 'form-prenotazione',
        loadComponent: () => import('./features/studente/form-prenotazione/form-prenotazione.page').then(m => m.FormPrenotazionePage)
      },
      {
        path: 'riepilogo-prenotazioni',
        loadComponent: () => import('./features/studente/riepilogo-prenotazioni/riepilogo-prenotazioni.page').then(m => m.RiepilogoPrenotazioniPage)
      },
      {
        path: 'dettaglio-prenotazione/:id',
        loadComponent: () => import('./features/studente/dettaglio-prenotazione/dettaglio-prenotazione.page').then(m => m.DettaglioPrenotazionePage)
      },
      {
        path: 'profilo-studente',
        loadComponent: () => import('./features/studente/profilo-studente/profilo-studente.page').then(m => m.ProfiloStudentePage)
      },
      {
        path: 'bacheca-studente',
        loadComponent: () => import('./features/studente/bacheca-studente/bacheca-studente.page').then(m => m.BachecaStudentePage)
      },
      {
        path: 'notifiche',
        loadComponent: () => import('./features/studente/notifiche/notifiche.page').then(m => m.NotifichePage)
      },
      {
        path: 'segnalazione',
        loadComponent: () => import('./features/studente/segnalazione/segnalazione.page').then(m => m.SegnalazionePage)
      }
    ]
  },
  {
    path: 'dashboard-docente',
    canActivate: [authGuard, roleGuard('docente')],
    loadComponent: () => import('./features/docente/dashboard-docente/dashboard-docente.page').then(m => m.DashboardDocentePage),
    children: [
      {
        path: '',
        redirectTo: 'prenotazioni-ricevute',
        pathMatch: 'full'
      },
      {
        path: 'gestione-slot',
        loadComponent: () => import('./features/docente/gestione-slot/gestione-slot.page').then(m => m.GestioneSlotPage)
      },
      {
        path: 'prenotazioni-ricevute',
        loadComponent: () => import('./features/docente/prenotazioni-ricevute/prenotazioni-ricevute.page').then(m => m.PrenotazioniRicevutePage)
      },
      {
        path: 'dettaglio-prenotazione-docente/:id',
        loadComponent: () => import('./features/docente/dettaglio-prenotazione-docente/dettaglio-prenotazione-docente.page').then(m => m.DettaglioPrenotazioneDocentePage)
      },
      {
        path: 'bacheca-docente',
        loadComponent: () => import('./features/docente/bacheca-docente/bacheca-docente.page').then(m => m.BachecaDocentePage)
      },
      {
        path: 'statistiche-docente',
        loadComponent: () => import('./features/docente/statistiche-docente/statistiche-docente.page').then(m => m.StatisticheDocentePage)
      },
      {
        path: 'profilo-docente',
        loadComponent: () => import('./features/docente/profilo-docente/profilo-docente.page').then(m => m.ProfiloDocentePage)
      }
    ]
  },
  {
    path: 'dashboard-admin',
    canActivate: [authGuard, roleGuard('amministratore')],
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.page').then(m => m.AdminLayoutPage),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard-admin/dashboard-admin.page').then(m => m.DashboardAdminPage),
      },
      {
        path: 'gestione-utenti',
        loadComponent: () => import('./features/admin/gestione-utenti/gestione-utenti.page').then(m => m.GestioneUtentiPage),
      },
      {
        path: 'gestione-slot-admin',
        loadComponent: () => import('./features/admin/gestione-slot-admin/gestione-slot-admin.page').then(m => m.GestioneSlotAdminPage),
      },
    ],
  },
  {
    path: 'gestione-utenti',
    redirectTo: 'dashboard-admin/gestione-utenti',
    pathMatch: 'full',
  },
  {
    path: 'gestione-slot-admin',
    redirectTo: 'dashboard-admin/gestione-slot-admin',
    pathMatch: 'full',
  },
  {
    path: 'unauthorized',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/unauthorized/unauthorized.page').then(m => m.UnauthorizedPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.page').then(m => m.HomePage)
  },

];
