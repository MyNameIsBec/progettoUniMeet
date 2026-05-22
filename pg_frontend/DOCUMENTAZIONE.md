# UniMeet — Documentazione Frontend

## 1. Panoramica

| Dettaglio | Valore |
|-----------|--------|
| Nome app | UniMeet |
| Framework | Angular 20 (standalone components) |
| UI Library | Ionic 8 + Capacitor 8 |
| Linguaggio | TypeScript 5.9 |
| Stili | SCSS |
| Mappe | Leaflet 1.9 |
| Testing | Jasmine + Karma |

UniMeet è una piattaforma per la gestione di prenotazioni di ricevimento tra studenti e docenti universitari. Supporta tre ruoli: **studente**, **docente** e **amministratore**.

---

## 2. Struttura delle directory

```
pg_frontend/
├── angular.json                  # Configurazione workspace Angular
├── capacitor.config.ts           # Configurazione Capacitor
├── ionic.config.json             # Configurazione Ionic (angular-standalone)
├── package.json                  # Dipendenze e script
├── tsconfig.json                 # TypeScript base
├── tsconfig.app.json             # TypeScript app
├── tsconfig.spec.json            # TypeScript test
├── .eslintrc.json                # ESLint
├── karma.conf.js                 # Karma test runner
├── src/
│   ├── index.html                # Entry point HTML
│   ├── main.ts                   # Bootstrap app (standalone)
│   ├── global.scss               # Stili globali + variabili CSS
│   ├── environments/
│   │   ├── environment.ts        # apiUrl: http://localhost:5000
│   │   └── environment.prod.ts   # apiUrl: http://localhost:5000
│   ├── theme/
│   │   └── variables.scss        # Tema Ionic + dark mode
│   └── app/
│       ├── app.component.*       # Componente root
│       ├── app.routes.ts         # Definizione rotte
│       ├── core/                 # Layer condiviso
│       │   ├── models/interfacce.ts   # Modelli TypeScript
│       │   ├── guards/           # Guardie di rotta
│       │   ├── interceptors/     # HTTP interceptor
│       │   └── services/         # Servizi API
│       ├── components/           # Componenti UI condivisi
│       │   ├── dashboard-layout/ # Layout authenticated pages
│       │   ├── sidebar/          # Sidebar navigazione
│       │   └── topbar/           # Topbar (menu mobile, theme, profilo)
│       └── features/             # Pagine (lazy-loaded)
│           ├── home/             # Landing page
│           ├── auth/             # Login, registrazione, password
│           ├── studente/         # 9 pagine studente
│           ├── docente/          # 9 pagine docente
│           └── admin/            # 6 pagine admin
```

---

## 3. Routing e navigazione

Tutte le rotte sono **lazy-loaded**. Le pagine autenticate usano il componente `DashboardLayoutComponent` come wrapper tramite content projection.

| Path | Pagina | Guardie | Ruolo |
|------|--------|---------|-------|
| `/home` | HomePage | — | Pubblico |
| `/login` | LoginPage | — | Pubblico |
| `/registrazione` | RegistrazionePage | — | Pubblico |
| `/recupera-password` | RecuperaPasswordPage | — | Pubblico |
| `/reset-password` | ResetPasswordPage | — | Pubblico |
| `/dashboard-studente` | DashboardStudentePage | auth + role('studente') | Studente |
| `/elenco-docenti` | ElencoDocentiPage | auth + role('studente') | Studente |
| `/prenota` | PrenotaPage | auth + role('studente') | Studente |
| `/riepilogo-prenotazioni` | RiepilogoPrenotazioniPage | auth + role('studente') | Studente |
| `/dettaglio-prenotazione/:id` | DettaglioPrenotazionePage | auth + role('studente') | Studente |
| `/profilo-studente` | ProfiloStudentePage | auth + role('studente') | Studente |
| `/bacheca-studente` | BachecaStudentePage | auth + role('studente') | Studente |
| `/notifiche-studente` | NotificheStudentePage | auth + role('studente') | Studente |
| `/segnalazione` | SegnalazionePage | auth + role('studente') | Studente |
| `/dashboard-docente` | DashboardDocentePage | auth + role('docente') | Docente |
| `/gestione-slot` | GestioneSlotPage | auth + role('docente') | Docente |
| `/prenotazioni-ricevute` | PrenotazioniRicevutePage | auth + role('docente') | Docente |
| `/dettaglio-prenotazione-docente/:id` | DettaglioPrenotazioneDocentePage | auth + role('docente') | Docente |
| `/bacheche-docente` | BachecheDocentePage | auth + role('docente') | Docente |
| `/notifiche-docente` | NotificheDocentePage | auth + role('docente') | Docente |
| `/documenti-docente` | DocumentiDocentePage | auth + role('docente') | Docente |
| `/statistiche-docente` | StatisticheDocentePage | auth + role('docente') | Docente |
| `/profilo-docente` | ProfiloDocentePage | auth + role('docente') | Docente |
| `/dashboard-admin` | DashboardAdminPage | auth + role('amministratore') | Admin |
| `/gestione-utenti-admin` | GestioneUtentiPage | auth + role('amministratore') | Admin |
| `/gestione-slot-admin` | GestioneSlotAdminPage | auth + role('amministratore') | Admin |
| `/gestione-segnalazioni` | GestioneSegnalazioniPage | auth + role('amministratore') | Admin |
| `/gestione-prenotazioni-admin` | GestionePrenotazioniAdminPage | auth + role('amministratore') | Admin |
| `/gestione-calendario` | GestioneCalendarioPage | auth + role('amministratore') | Admin |

Le guardie sono due funzioni in `core/guards/auth-guard.ts`:
- **`authGuard`** — verifica che l'utente sia loggato, altrimenti redirect a `/login`
- **`roleGuard(ruolo)`** — factory che verifica il ruolo, altrimenti redirect a `/login`

---

## 4. Modelli (interfacce)

File: `src/app/core/models/interfacce.ts`

| Interfaccia | Estende | Campi principali |
|-------------|---------|------------------|
| `VoceMenuNavigazione` | — | etichetta, percorso, icona, esatto |
| `Utente` | — | id, nome, cognome, email, ruolo |
| `Studente` | Utente | matricola, corsoDiStudi |
| `Docente` | Utente | ufficio, materia, coloreAvatar, iniziali, corsoDiStudi[], corsiDiStudi[] |
| `Amministratore` | Utente | dipartimento |
| `CorsoDiStudi` | — | id, nome |
| `Corso` | — | id, nome, cfu, anno, docenteId |
| `LuogoRicevimento` | — | id, aula, edificio, piano, latitudine, longitudine |
| `SlotRicevimento` | — | id, docenteId, data, oraInizio, oraFine, disponibilita, luogo |
| `Prenotazione` | — | id, studenteId, docente, materia, data, ora, stato, luogo, documenti, studente |
| `Documento` | — | id, nomeFile, tipo, studente, prenotazioneId, data, percorso |
| `Bacheca` | — | id, titolo, descrizione, faqs[], corsoDiStudi |
| `FAQ` | — | id, domanda, risposta, aperta |

---

## 5. Pagine per ruolo

### Pubbliche

| Pagina | Descrizione |
|--------|-------------|
| **HomePage** | Landing page con hero section, scroll spy, features |
| **LoginPage** | Form di login con email/password |
| **RegistrazionePage** | Registrazione nuovo studente |
| **RecuperaPasswordPage** | Richiesta reset password (multi-step) |
| **ResetPasswordPage** | Reset password con token |

### Studente (9 pagine)

| Pagina | Descrizione |
|--------|-------------|
| **DashboardStudentePage** | Riepilogo con prossime prenotazioni, statistiche, FAQ rapide |
| **ElencoDocentiPage** | Ricerca docenti per nome/corso con card |
| **PrenotaPage** | Calendario, selezione docente, slot, conferma con modale |
| **RiepilogoPrenotazioniPage** | Storico prenotazioni con filtri per stato |
| **DettaglioPrenotazionePage** | Dettaglio con mappa Leaflet del luogo |
| **ProfiloStudentePage** | Modifica profilo, cambio password, elimina account |
| **BachecaStudentePage** | FAQ e link utili per corso di studi |
| **NotificheStudentePage** | Centro notifiche con filtri (lette/non lette) |
| **SegnalazionePage** | Form segnalazione problema + storico |

### Docente (9 pagine)

| Pagina | Descrizione |
|--------|-------------|
| **DashboardDocentePage** | Riepilogo attività, prossimi ricevimenti, statistiche personali |
| **GestioneSlotPage** | CRUD slot disponibili con calendario e modali |
| **PrenotazioniRicevutePage** | Elenco prenotazioni con filtri (stato/data/ricerca), conferma/annulla, agenda oggi |
| **DettaglioPrenotazioneDocentePage** | Dettaglio prenotazione con mappa e documenti |
| **BachecheDocentePage** | Gestione bacheche e FAQ per corso di studi |
| **NotificheDocentePage** | Centro notifiche con filtri (lette/non lette/promemoria) |
| **DocumentiDocentePage** | Documenti, upload e gestione allegati |
| **StatisticheDocentePage** | Statistiche sugli argomenti di ricevimento |
| **ProfiloDocentePage** | Modifica profilo |

### Admin (6 pagine)

| Pagina | Descrizione |
|--------|-------------|
| **DashboardAdminPage** | Statistiche globali (utenti, prenotazioni, slot) |
| **GestioneUtentiPage** | CRUD utenti (crea, modifica, elimina, filtro per ruolo) |
| **GestioneSlotAdminPage** | CRUD slot globali |
| **GestioneSegnalazioniPage** | Gestione segnalazioni (cambio stato, elimina) |
| **GestionePrenotazioniAdminPage** | Gestione prenotazioni (cambio stato, dettagli, elimina) |
| **GestioneCalendarioPage** | Blocco/sblocco giorni calendario |

---

## 6. Servizi (API)

Tutti i servizi usano `providedIn: 'root'` e il pattern `BehaviorSubject` per lo stato reattivo dell'utente (`AuthService.currentUser$`).

| Servizio | File | Endpoint API principali |
|----------|------|------------------------|
| `AuthService` | `core/services/auth.ts` | POST `/api/login`, `/api/registrazione`, POST `/api/auth/change-password`, GET `/api/auth/profile`, POST `/api/auth/refresh`, `/api/recupera-password`, `/api/reset-password` |
| `StudenteService` | `core/services/studente.ts` | GET/PUT/DELETE `/api/studenti/:matricola` |
| `DocenteService` | `core/services/docente.ts` | GET `/api/docenti`, slot CRUD |
| `PrenotazioneService` | `core/services/prenotazione.ts` | CRUD `/api/prenotazioni` |
| `BachecaService` | `core/services/bacheca.ts` | GET `/api/bacheche`, FAQ CRUD |
| `SegnalazioneService` | `core/services/segnalazione.ts` | CRUD `/api/segnalazioni` |
| `NotificaService` | `core/services/notifica.ts` | GET/PATCH `/api/notifiche`, polling 30s |
| `DocumentoService` | `core/services/documento.ts` | POST upload, GET/DELETE `/api/documenti` |
| `AdminService` | `core/services/admin.ts` | CRUD `/api/admin/utenti`, `/api/admin/slot`, `/api/admin/prenotazioni`, stats |
| `ErroriService` | `core/services/errori.ts` | Gestione errori HTTP con toast in italiano |
| `PasswordValidator` | `core/validators/password.validator.ts` | Validazione password con requisiti di complessità |

---

## 7. Componenti condivisi

### DashboardLayoutComponent
Wrapper per tutte le pagine autenticate. Usa content projection (`<ng-content>`) per includere la pagina specifica.

```
DashboardLayoutComponent
├── SidebarComponent        — Navigazione laterale desktop (280px)
├── TopbarComponent         — Hamburger mobile, toggle dark mode, campanella notifiche, profilo
└── <ng-content>            — Contenuto della pagina
```

### SidebarComponent
- Navigazione a sinistra con voci di menu dinamiche in base al ruolo
- Mostra nome e ruolo utente in alto
- Pulsante logout

### TopbarComponent
- Menu hamburger per mobile (mostra/nasconde sidebar)
- Toggle tema chiaro/scuro (persiste in localStorage)
- Icona notifiche con badge
- Link al profilo e logout

---

## 8. Interceptor e Guardie

### Auth Interceptor (`core/interceptors/auth-interceptor.ts`)
- Funzione funzionale `HttpInterceptorFn`
- Prepone `http://localhost:5000/` alle URL relative
- Aggiunge header `Authorization: Bearer <token>`
- Su errore 401: pulisce la sessione e redirect a `/login`

### Auth Guard (`core/guards/auth-guard.ts`)
- **`authGuard`**: `CanActivateFn` — controlla `AuthService.isLoggedIn()`
- **`roleGuard(ruolo)`**: factory — controlla `AuthService.hasRole(ruolo)`

Registrazione in `main.ts`:
```typescript
provideHttpClient(withInterceptors([intercettoreAutenticazione]))
```

---

## 9. Styling

| File | Ruolo |
|------|-------|
| `global.scss` | Stili globali, variabili CSS custom (--primary-blue, --text-dark), grid dashboard (260px sidebar + 1fr main), hero section, card, responsive breakpoints, classi utility |
| `theme/variables.scss` | Override variabili Ionic (primary: #2563eb), dark mode completo (~800 righe di override per ogni componente: sidebar, topbar, cards, tabelle, modali, alert, badge) |
| `*.page.scss` / `*.component.scss` | Stili scoped per componente tramite `:host` |

Caratteristiche del design system:
- Colore primario: blu #2563eb
- Font: Inter
- Bordi arrotondati: 12–28px
- Layout card-based con griglie
- Dark mode: classe `.dark` su `<body>`, persistita in localStorage
- Breakpoint responsive: 1200px, 1100px, 991px, 900px, 700px, 600px, 450px

---

## 10. Ambienti e configurazione

| File | Contenuto |
|------|-----------|
| `src/environments/environment.ts` | `apiUrl: 'http://localhost:5000'` (sviluppo) |
| `src/environments/environment.prod.ts` | `apiUrl: 'http://localhost:5000'` (produzione) |

### Bootstrap (`main.ts`)
```typescript
provideHttpClient(withInterceptors([intercettoreAutenticazione])),
provideIonicAngular({ mode: 'md' }),
{ provide: LOCALE_ID, useValue: 'it-IT' },
```
- Locale italiano (`it-IT`)
- Modalità Material Design

---

## 11. Stato implementazione

| Area | Pagine | Stato |
|------|--------|-------|
| Home | 1 | ✅ Completato |
| Autenticazione | 4 | ✅ Completato |
| Studente | 9 | ✅ Completato |
| Admin | 6 | ✅ Completato |
| Docente | 9 | ✅ Completato |
| Componenti condivisi | 3 | ✅ Completato |
| Servizi | 12 | ✅ Completato |

---

## 12. Convenzioni di codice

- **File**: `nome-feature.tipo.ts` (es. `dashboard-studente.page.ts`)
- **Componenti standalone** — nessun NgModule
- **Guardie funzionali** con `CanActivateFn`
- **Interceptor funzionali** con `HttpInterceptorFn`
- **Caricamento lazy** per tutte le pagine via `loadComponent`
- **State management**: BehaviorSubject in AuthService + localStorage per sessione e tema
- **Form**: Reactive Forms (auth) e template-driven (feature pages)
- **UI in italiano** — etichette, toast, messaggi
- **RxJS** — Observable, Subscription, firstValueFrom, pipe, catchError
- **Test** Jasmine + Karma, file `.spec.ts` co-locati

---

## 13. Proposta — Pagina "Impostazioni" (docenti e studenti)

### Obiettivo
Creare una pagina separata dal profilo in cui docenti e studenti possano configurare preferenze e comportamenti dell'app.

### Impostazioni proposte

| Impostazione | Tipo | Default | Descrizione |
|---|---|---|---|
| Tema | `light \| dark \| system` | `system` | Preferenza tema chiaro/scuro |
| Notifiche app | boolean | `true` | Notifiche push/in-app |
| Notifiche email | boolean | `true` | Notifiche via email |
| Promemoria (ore prima) | `1 \| 3 \| 24 \| 48` | `24` | Anticipo promemoria ricevimento |
| Lingua | `it \| en` | `it` | Lingua interfaccia (per futuro i18n) |

### Backend — modifiche necessarie

**Prisma schema** — aggiungere colonne a `Studente` e `Docente`:
```
notifiche_app    Boolean  @default(true)
notifiche_email  Boolean  @default(true)
reminder_ore     Int      @default(24)
tema             String   @default("system")
lingua           String   @default("it")
```

**Nuovo endpoint unificato** (via `/api/auth/`):
- `GET /api/auth/impostazioni` — ottieni impostazioni utente corrente
- `PUT /api/auth/impostazioni` — aggiorna impostazioni (con validatore)

I metodi `getImpostazioni` e `aggiornaImpostazioni` vanno aggiunti ad `auth.service.ts` (backend) e chiamano il modello Prisma corrispondente in base al ruolo.

### Frontend — nuove pagine

```
pg_frontend/src/app/features/docente/impostazioni-docente/
  ├── impostazioni-docente.page.html
  ├── impostazioni-docente.page.ts
  └── impostazioni-docente.page.scss

pg_frontend/src/app/features/studente/impostazioni-studente/
  ├── impostazioni-studente.page.html
  ├── impostazioni-studente.page.ts
  └── impostazioni-studente.page.scss
```

**AuthService frontend** — aggiungere:
- `getImpostazioni()` → `GET /api/auth/impostazioni`
- `aggiornaImpostazioni(data)` → `PUT /api/auth/impostazioni`

**Nuove route** in `app.routes.ts`:
- `/impostazioni-docente` con `canActivate: [authGuard, roleGuard('docente')]`
- `/impostazioni-studente` con `canActivate: [authGuard, roleGuard('studente')]`

**Sidebar** — aggiungere voce "Impostazioni" (icona `settings-outline`) nei menu di docente e studente in `DashboardLayoutComponent`.

**`variables.scss`** — aggiungere selettori `app-impostazioni-docente` e `app-impostazioni-studente` al blocco `body.dark`.

### Da decidere

1. **Separazione dal profilo**: le notifiche/reminder attualmente compaiono in `profilo-studente`. Vanno rimosse da lì se si spostano in Impostazioni?
2. **Backend unificato vs per ruolo**: unico (`/api/auth/impostazioni`) è più semplice; separati (`/api/docenti/:id/impostazioni`, `/api/studenti/:matricola/impostazioni`) danno maggiore controllo.
3. **Tema**: già gestito in topbar + localStorage. Va comunque salvato anche su DB per persistenza cross-device?
4. **Altre impostazioni da aggiungere/rimuovere?**

---

## 14. Bug noti e fix applicati

### 14.1 Dark mode — !important mancante in variables.scss

**Problema:** I selettori globali `body.dark .classe` in `variables.scss` avevano la stessa specificità (0,2,0) degli stili locali nei componenti (`.classe[_ngcontent-cX]` = 0,2,0). Poiché Angular carica gli stili dei componenti dopo quelli globali, il tema scuro non vinceva: sfondi bianchi e testi nero su nero in tutte le pagine admin e in molte pagine docente/studente in dark mode.

**Causa radice:** Specificità CSS identica + ordine di caricamento (component styles iniettati dopo global styles).

**Fix (commit `c367b10`, `e19791c`):** Aggiunto `!important` a tutte le 294 dichiarazioni target (`background`, `--background`, `color`, `--color`, `border`, `border-color`, `box-shadow`, `--border-color`, `--placeholder-color`) dentro il blocco `body.dark` in `theme/variables.scss`. Estende il pattern già esistente usato per le card (`.summary-card`, `.main-card`, ecc.). Ora il tema scuro vince sempre indipendentemente dalla specificità dei selettori dei componenti.

**File modificato:** `src/theme/variables.scss`

---

### 14.2 Gestione slot admin — race condition apertura modale

**Problema:** Due bug distinti sulla stessa pagina:

1. **Testo "Crea slot" non visibile** sul bottone submit dentro la modale: il binding `{{ slotInModifica ? 'Salva modifiche' : 'Crea slot' }}` non veniva valutato subito all'apertura della modale (template ternario dentro `<ng-template>` in `<ion-modal>`).

2. **Opzioni docente non appaiono** le prime 1-2 volte che si apre la modale: `apriModaleCrea()` chiamava `caricaDocenti()` che azzerava l'array `docenti` e faceva una nuova HTTP request. La modale si apriva prima che la risposta arrivasse, mostrando lo ion-select vuoto.

**Causa radice:** Duplicazione HTTP request (`ngOnInit` + `apriModaleCrea`) + template ternario su variabile runtime dentro `ion-modal > ng-template`.

**Fix (commit `4ec3404`):**
- **Caching one-shot:** `caricaDocenti()` ora usa flag `docentiInCaricamento` per eseguire una sola HTTP request, qualunque sia il numero di chiamate.
- **`modalButtonText`:** Sostituito il binding ternario con una proprietà stringa semplice (`modalButtonText = 'Crea slot'`), settata prima di aprire la modale.
- **Fallback caricamento:** Lo ion-select del docente mostra `@if (docentiCaricati)` con le opzioni reali, o un'opzione placeholder "Caricamento..." mentre i dati non sono pronti.

**File modificati:**
- `src/app/features/admin/gestione-slot-admin/gestione-slot-admin.page.ts`
- `src/app/features/admin/gestione-slot-admin/gestione-slot-admin.page.html`

---

### 14.3 Docente — piano edificio non numerico

**Problema:** Il campo `piano` del luogo era tipizzato come `number` nell'interfaccia TypeScript e passato a `parseInt()` nel backend. Valori come "Primo piano" o "Piano terra" producevano `NaN` e non venivano visualizzati correttamente.

**Fix (commit `07057b4`):** Cambiato `piano: number` → `piano: string` in `interfacce.ts`. Rimosso `parseInt()` su `s.luogo.piano` in `docenti.service.ts` (backend).

**File modificati:**
- `src/app/core/models/interfacce.ts`
- `pg_backend/src/services/docenti.service.ts`**
