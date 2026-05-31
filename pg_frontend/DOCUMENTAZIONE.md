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
│       │   ├── services/         # Servizi API
│       │   └── validators/       # Validatori custom (password)
│       ├── components/           # Componenti UI condivisi
│       │   ├── dashboard-layout/ # Layout authenticated pages
│       │   ├── sidebar/          # Sidebar navigazione
│       │   └── topbar/           # Topbar (menu mobile, theme, profilo)
│       └── features/             # Pagine (lazy-loaded)
│           ├── home/             # Landing page
│           ├── auth/             # Login, registrazione, password
│           ├── studente/         # 9 pagine studente
│           ├── docente/          # 10 pagine docente
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
| `/segnalazioni-studente` | SegnalazioniStudentePage | auth + role('studente') | Studente |
| `/dashboard-docente` | DashboardDocentePage | auth + role('docente') | Docente |
| `/gestione-slot` | GestioneSlotPage | auth + role('docente') | Docente |
| `/prenotazioni-ricevute` | PrenotazioniRicevutePage | auth + role('docente') | Docente |
| `/dettaglio-prenotazione-docente/:id` | DettaglioPrenotazioneDocentePage | auth + role('docente') | Docente |
| `/bacheche-docente` | BachecheDocentePage | auth + role('docente') | Docente |
| `/notifiche-docente` | NotificheDocentePage | auth + role('docente') | Docente |
| `/statistiche-docente` | StatisticheDocentePage | auth + role('docente') | Docente |
| `/profilo-docente` | ProfiloDocentePage | auth + role('docente') | Docente |
| `/documenti-docente` | DocumentiDocentePage | auth + role('docente') | Docente |
| `/segnalazioni-docente` | SegnalazioniDocentePage | auth + role('docente') | Docente |
| `/dashboard-admin` | DashboardAdminPage | auth + role('amministratore') | Admin |
| `/gestione-account` | GestioneAccountPage | auth + role('amministratore') | Admin |
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
| `CorsoDiStudi` | — | id_corso_di_studi, nome |
| `Corso` | — | id_corso, nome_corso, cfu, anno, id_docente |
| `LuogoRicevimento` | — | id_luogo, nome_aula, edificio, piano, latitudine, longitudine |
| `SlotRicevimento` | — | id_slot, id_docente, data, ora_inizio, ora_fine, disponibilita, luogo |
| `Prenotazione` | — | id_prenotazione, studente, docente, argomento, data, ora, stato_prenotazione, luogo, documenti |
| `Documento` | — | id_documento, nome_file, tipo, matricola_studente, id_prenotazione, data_caricamento, percorso_file |
| `Bacheca` | — | id_bacheca, titolo, descrizione, faqs[], corsoDiStudi, nomeCorsoDiStudi, dataUltimoAggiornamento |
| `FAQ` | — | id_faq, domanda, risposta, data_pubblicazione, idDocente?, nomeDocente? |
| `Segnalazione` | — | id_segnalazione, oggetto, descrizione, data_invio, stato, allegato? |
| `Notifica` | — | id_notifica, titolo, messaggio, data_invio, letta, tipo |

---

## 5. Pagine per ruolo

### Pubbliche (5 pagine)

| Pagina | Descrizione |
|--------|-------------|
| **HomePage** | Landing page con hero section, scroll spy, features |
| **LoginPage** | Form di login con email/password |
| **RegistrazionePage** | Registrazione nuovo studente |
| **RecuperaPasswordPage** | Richiesta reset password (multi-step) |
| **ResetPasswordPage** | Reset password con codice |

### Studente (9 pagine)

| Pagina | Path | Descrizione |
|--------|------|-------------|
| **DashboardStudentePage** | `/dashboard-studente` | Riepilogo con prossime prenotazioni, statistiche, FAQ rapide |
| **ElencoDocentiPage** | `/elenco-docenti` | Ricerca docenti per nome/corso con card |
| **PrenotaPage** | `/prenota` | Calendario, selezione docente, slot, conferma con modale |
| **RiepilogoPrenotazioniPage** | `/riepilogo-prenotazioni` | Storico prenotazioni con filtri per stato |
| **DettaglioPrenotazionePage** | `/dettaglio-prenotazione/:id` | Dettaglio con mappa Leaflet del luogo |
| **ProfiloStudentePage** | `/profilo-studente` | Modifica profilo, cambio password, elimina account |
| **BachecaStudentePage** | `/bacheca-studente` | FAQ del corso di studi con filtro per docente |
| **NotificheStudentePage** | `/notifiche-studente` | Centro notifiche |
| **SegnalazioniStudentePage** | `/segnalazioni-studente` | Invia segnalazione malfunzionamento |

### Docente (10 pagine)

| Pagina | Path | Descrizione |
|--------|------|-------------|
| **DashboardDocentePage** | `/dashboard-docente` | Riepilogo prenotazioni, percentuale riempimento slot |
| **GestioneSlotPage** | `/gestione-slot` | CRUD slot con mappa Leaflet per selezionare luogo |
| **PrenotazioniRicevutePage** | `/prenotazioni-ricevute` | Elenco prenotazioni ricevute |
| **DettaglioPrenotazioneDocentePage** | `/dettaglio-prenotazione-docente/:id` | Dettaglio con mappa, note, allegati |
| **BachecheDocentePage** | `/bacheche-docente` | Gestione FAQ delle proprie bacheche |
| **NotificheDocentePage** | `/notifiche-docente` | Centro notifiche |
| **StatisticheDocentePage** | `/statistiche-docente` | Statistiche argomenti ricevimento |
| **ProfiloDocentePage** | `/profilo-docente` | Modifica profilo |
| **DocumentiDocentePage** | `/documenti-docente` | Documenti caricati dagli studenti |
| **SegnalazioniDocentePage** | `/segnalazioni-docente` | Invia segnalazione malfunzionamento |

### Admin (6 pagine)

| Pagina | Path | Descrizione |
|--------|------|-------------|
| **DashboardAdminPage** | `/dashboard-admin` | Statistiche globali (utenti, prenotazioni, slot) |
| **GestioneAccountPage** | `/gestione-account` | CRUD utenti (crea, modifica, elimina, filtro per ruolo) |
| **GestioneSlotAdminPage** | `/gestione-slot-admin` | CRUD slot globali |
| **GestioneSegnalazioniPage** | `/gestione-segnalazioni` | Gestione segnalazioni (cambio stato, elimina) |
| **GestionePrenotazioniAdminPage** | `/gestione-prenotazioni-admin` | Gestione prenotazioni (cambio stato, dettagli, elimina) |
| **GestioneCalendarioPage** | `/gestione-calendario` | Blocco/sblocco giorni calendario |

---

## 6. Servizi (API)

Tutti i servizi usano `providedIn: 'root'` e il pattern `BehaviorSubject` per lo stato reattivo dell'utente (`AuthService.currentUser$`).

| Servizio | File | Endpoint API principali |
|----------|------|------------------------|
| `AuthService` | `core/services/auth.ts` | POST `/api/login`, `/api/registrazione`, POST `/api/auth/change-password`, GET `/api/auth/profile`, POST `/api/auth/refresh`, `/api/recupera-password`, `/api/reset-password`, POST `/api/auth/verifica-codice`, GET `/api/corsi-di-studio` |
| `StudenteService` | `core/services/studente.ts` | GET/PUT/DELETE `/api/studenti/:matricola`, POST cambia-password |
| `DocenteService` | `core/services/docente.ts` | GET `/api/docenti`, slot CRUD, statistiche, aggiorna profilo |
| `PrenotazioneService` | `core/services/prenotazione.ts` | CRUD `/api/prenotazioni`, upload documenti |
| `BachecaService` | `core/services/bacheca.ts` | GET `/api/bacheche`, FAQ CRUD, bacheche docente |
| `SegnalazioneService` | `core/services/segnalazione.ts` | CRUD `/api/segnalazioni` (studente e docente) |
| `NotificaService` | `core/services/notifica.ts` | GET/PATCH `/api/notifiche` |
| `AdminService` | `core/services/admin.ts` | CRUD `/api/admin/utenti`, `/api/admin/slot`, `/api/admin/prenotazioni`, `/api/admin/giorni-bloccati`, stats |
| `DocumentoService` | `core/services/documento.ts` | GET/DELETE `/api/documenti` |
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
| Docente | 10 | ✅ Completato |
| Admin | 6 | ✅ Completato |
| Componenti condivisi | 3 | ✅ Completato |
| Servizi | 11 | ✅ Completato |

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

## 13. Bug noti e fix applicati

### 13.1 Dark mode — `!important` mancante in variables.scss

**Problema:** I selettori globali `body.dark .classe` in `variables.scss` avevano la stessa specificità (0,2,0) degli stili locali nei componenti. Poiché Angular carica gli stili dei componenti dopo quelli globali, il tema scuro non vinceva.

**Fix:** Aggiunto `!important` a tutte le 294 dichiarazioni target dentro il blocco `body.dark` in `theme/variables.scss`.

### 13.2 Gestione slot admin — race condition apertura modale

**Problema:** Il testo "Crea slot" non era visibile sul bottone submit nella modale (binding ternario non valutato subito) e le opzioni docente non apparivano le prime volte (duplicazione HTTP request).

**Fix:** Caching one-shot con flag `docentiInCaricamento`, sostituito binding ternario con proprietà stringa semplice (`modalButtonText`), placeholder "Caricamento..." nello ion-select.

### 13.3 Topbar dark mode — classi CSS errate in variables.scss

**Problema:** I selettori `body.dark` usavano nomi di classi inesistenti per elementi topbar (`.menu-toggle` invece di `.toggle-menu`, ecc.).

**Fix:** Corretti tutti i selettori in `variables.scss` per corrispondere alle classi reali del template `topbar.component.html`.

### 13.4 Docente — piano edificio non numerico

**Problema:** `piano` tipizzato come `number` nell'interfaccia e passato a `parseInt()` nel backend. Valori "Primo piano" producevano `NaN`.

**Fix:** Cambiato `piano: number` → `piano: string` in `interfacce.ts` e rimosso `parseInt()` nel backend.

### 13.5 Bacheca studente — selettore docente e info bacheca

**Problema:** La pagina mostrava solo l'elenco FAQ senza nome/descrizione bacheca. Nessun filtro per docente.

**Fix:**
- Backend: aggiunto `id_docente` al modello FAQ (FK → Docente), migration `20260526184543`
- Backend: `BachecaResponse` include `nomeCorsoDiStudi`; `FAQResponse` include `idDocente`, `nomeDocente`
- Frontend: salvato oggetto bacheca completo, ion-segment per filtrare FAQ per docente

### 13.6 Logout non rosso in dark mode

**Problema:** Il testo "Logout" non appariva rosso (`#ef4444`) in dark mode, sovrascritto da regole globali.

**Fix:** Aggiunte regole `:host-context(body.dark)` con `!important` in `topbar.component.scss` e `sidebar.component.scss`.

### 13.7 TS5103 — ignoreDeprecations non valido

**Problema:** `tsconfig.json` conteneva `"ignoreDeprecations": "6.0"` non supportato da TypeScript 5.9.

**Fix:** Rimosso `"ignoreDeprecations": "6.0"` dal `tsconfig.json`.

---

## 14. Bug Hunt — Piano di fix

### Fase 7 — Missing Ionic imports (check completo)

| # | Task | Stima |
|---|------|-------|
| 7.1 | Scansionare TUTTI i .html delle feature pages e verificare che ogni componente Ionic usato sia importato nel .ts corrispondente | media |

### Fix applicati (sessione 26/05/2026)

| # | Bug | Fix |
|---|-----|-----|
| 1 | `bacheche-docente`: mancava `IonItem` negli imports | Aggiunto `IonItem` a `@Component.imports` |
| 2 | `elenco-docenti`: non filtrava per CorsoDiStudi dello studente | Ora carica profilo e passa `mioCorso` alla API |
| 3 | `prenota`: `(user as any).corsoDiStudi` sempre undefined | Iniettato `StudenteService`, caricato profilo per ottenere `corsoDiStudi` |
| 4 | `bacheca-studente`: doppia chiamata API per le FAQ | Usa `bacheca.faqs` embeddati |
| 5 | FAQ: nessun filtro per docente, nessuna info bacheca | Aggiunto `id_docente` al modello, selettore frontend (vd. 13.5) |
| 6 | Logout non rosso in dark mode | Aggiunte regole `:host-context(body.dark)` (vd. 13.6) |
| 7 | `tsconfig.json`: TS5103 ignoreDeprecations | Rimossa opzione (vd. 13.7) |
