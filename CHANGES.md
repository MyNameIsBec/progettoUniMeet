# CHANGES

## Recupero password con codice di verifica 6 cifre — 14/05/2026

**Modifica:** Sostituito il sistema JWT-link per il reset password con un sistema a codice di verifica 6 cifre inviato via email. Il codice è riutilizzabile per futura autenticazione a due fattori (2FA). Implementata UI multi-step sulla pagina `recupera-password`.

### Backend — Nuovi file

#### `pg_backend/src/services/email.service.ts`
- Servizio email con nodemailer (SMTP configurabile via `.env`)
- Se SMTP non configurato, logga l'email in console (utile per sviluppo)
- `sendEmail(to, subject, html)` — invio generico
- `sendCodiceVerifica(email, codice, tipo)` — invio codice con template HTML brandizzato

#### `pg_backend/src/services/codice-verifica.service.ts`
- `generaCodice()` → 6 cifre casuali via `crypto.randomInt`
- `creaCodice(email, tipo)` → hash bcrypt, salva su DB, restituisce plain-code
- `verificaCodice(email, codice, tipo)` → confronta hash senza consumare (per 2FA)
- `consumaCodice(email, codice, tipo)` → confronta hash e marca come usato

### Backend — Modificati

#### `pg_backend/prisma/schema.prisma`
- Nuovo modello `CodiceVerifica` con campi: id, email, codice (hash), tipo, scadenza, usato, creato_il
- Indice composto su `(email, tipo)`

#### `pg_backend/src/services/auth.service.ts`
- `forgotPassword(email)` ora genera codice 6 cifre + invia via email (anziché JWT link)
- Nuova funzione `verificaCodice(email, codice)` — verifica senza consumare
- `resetPassword(email, codice, nuovaPassword)` — consuma codice + aggiorna password

#### `pg_backend/src/controllers/auth.controller.ts`
- Nuovo handler `verificaCodice` (200/401)
- `resetPassword` ora accetta `{ email, codice, nuovaPassword }`

#### `pg_backend/src/validators/auth.validators.ts`
- Nuovo `verificaCodiceSchema`: email + codice
- Aggiornato `resetPasswordSchema`: email + codice + nuovaPassword

#### `pg_backend/src/routes/auth.routes.ts`
- Nuova route `POST /api/auth/verifica-codice`

#### `pg_backend/.env`
- Aggiunte variabili SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- Valori di default per sviluppo (SMTP non configurato → log console)

### Frontend — Modificati

#### `pg_frontend/src/app/core/services/auth.ts`
- Nuovo metodo `verificaCodice(email, codice): Observable<{ valido: boolean }>`
- `confermaResetPassword` ora accetta `(email, codice, nuovaPassword)`

#### `pg_frontend/src/app/features/auth/recupera-password/recupera-password.page.ts`
- Riscritto con 4-step flow: `email → codice → password → completato`
- Step 1: form email (esistente)
- Step 2: input codice 6 cifre con validazione pattern
- Step 3: nuova password + conferma con strength meter, eye toggle, pwd-rules
- Step 4: stato di completamento

#### `pg_frontend/src/app/features/auth/reset-password/reset-password.page.ts`
- Aggiornato a nuova API: legge `email` + `codice` da query params invece di `token`

### Database

#### Nuova migrazione: `20260514182735_add_codice_verifica`
- Tabella `CodiceVerifica`
- Aggiunte colonne `Notifica` mancanti (titolo, letta, destinatario_id, destinatario_ruolo) con gestione dati esistenti
- Tabella `Segnalazione`
- Tabella `GiornoBloccato`

### Test end-to-end

```
POST /api/recupera-password  →  codice 6 cifre (log/email) ✅
POST /api/auth/verifica-codice  →  { valido: true } (non consuma) ✅
POST /api/reset-password  →  password cambiata (consuma codice) ✅
POST /api/login  →  login con nuova password ✅
```

---

## Backend Notifiche multi-ruolo (Fase 7) + fix campanella admin — 14/05/2026

**Modifica:** Implementato backend CRUD Notifiche con supporto multi-ruolo (studente, docente, amministratore). Aggiornato schema DB, creati service/controller/routes/validators, aperta rotta `/notifiche` a tutti gli autenticati.

### Backend — schema DB

#### `prisma/schema.prisma`
- `Notifica`: rimosso `matricola_studente` + relazione con `Studente`
- Aggiunti `destinatario_id` (String) e `destinatario_ruolo` (String: STUDENTE, DOCENTE, AMMINISTRATORE)
- Rimosso `notifiche` da `Studente` (non più necessaria)

#### Migrazione: `20260514133349_notifiche_multi_ruolo`

### Backend — nuovi file

#### `pg_backend/src/services/notifiche.service.ts`
- `getNotifiche(destinatarioId, ruolo?)` — filtra per ID destinatario + ruolo opzionale
- `createNotifica(data)` — crea notifica per qualsiasi ruolo
- `segnaComeLetta(id)` — marca singola notifica
- `segnaTutteComeLette(destinatarioId)` — marca tutto come letto
- `cancellaNotificheLette(destinatarioId)` — elimina notifiche lette

#### `pg_backend/src/validators/notifiche.validators.ts`
- `creaNotificaSchema` — titolo, messaggio, tipo, destinatarioId, destinatarioRuolo

### Backend — file implementati (erano vuoti)

#### `pg_backend/src/controllers/notifiche.controller.ts`
- 5 handler: getNotifiche, createNotifica, segnaComeLetta, segnaTutteComeLette, cancellaNotificheLette

#### `pg_backend/src/routes/notifiche.routes.ts`
- `GET /api/notifiche/:destinatarioId`, `POST /api/notifiche`, `PATCH /api/notifiche/:id/letta`, `POST /api/notifiche/:destinatarioId/letta-tutte`, `DELETE /api/notifiche/:destinatarioId/lette`

### Backend — file modificati

#### `pg_backend/src/app.ts`
- Registrate `notificheRoutes`

#### `pg_backend/prisma/seed.ts`
- Notifiche per tutti e 3 i ruoli: 5 per studente (MAT001), 2 per docente, 2 per admin

### Frontend — file modificati

#### `pg_frontend/src/app/core/services/notifica.ts`
- Interfaccia Notifica: `matricola_studente` → `destinatarioId` + `destinatarioRuolo`
- `getNotifiche(matricola)` → `getNotifiche(destinatarioId)`

#### `pg_frontend/src/app/app.routes.ts`
- Rotta `/notifiche`: `roleGuard('studente')` → solo `authGuard`

#### `pg_frontend/src/app/features/studente/notifiche/notifiche.page.html`
- `n.data_invio` → `n.dataInvio` (camelCase, nuovo field name)

### Documentazione

#### `pg_backend/TODO.md`
- Fase 7 segnata come completata ✅

#### `pg_backend/DOCUMENTAZIONE.md`
- Tabella services/validators/Fasi aggiornate
- Sezione endpoint notifiche aggiunta

## Backend Bacheca/FAQ (Fase 4) — 14/05/2026

**Modifica:** Implementato backend CRUD Bacheca e FAQ (service, controller, validators, routes) con 6 endpoint.

### Backend — nuovi file

#### `pg_backend/src/services/bacheca.service.ts`
- `getBachecaByCorso(idCorso)` — restituisce bacheca + FAQ; se non esiste, la crea automaticamente
- `updateBacheca(idCorso, data)` — aggiorna titolo/descrizione
- `getFaqByBacheca(idCorso)` — FAQ ordinate per data discendente
- `createFaq(idCorso, data)` — crea FAQ con validazione bacheca esistente
- `updateFaq(id, data)` — modifica domanda/risposta
- `deleteFaq(id)` — elimina FAQ

#### `pg_backend/src/controllers/bacheca.controller.ts`
- 6 handler HTTP con gestione errori 404/500

#### `pg_backend/src/routes/bacheche.routes.ts`
- `GET /api/bacheche/:idCorso` — pubblico
- `PUT /api/bacheche/:idCorso` — JWT + authorize(DOCENTE, AMMINISTRATORE)
- `GET /api/bacheche/:idCorso/faq` — pubblico
- `POST /api/bacheche/:idCorso/faq` — JWT + authorize(DOCENTE, AMMINISTRATORE)
- `PUT /api/faq/:id` — JWT + authorize(DOCENTE, AMMINISTRATORE)
- `DELETE /api/faq/:id` — JWT + authorize(DOCENTE, AMMINISTRATORE)

#### `pg_backend/src/validators/bacheca.validators.ts`
- `aggiornaBachecaSchema`, `creaFaqSchema`, `modificaFaqSchema`

### Backend — file modificati

#### `pg_backend/src/app.ts`
- Importate e registrate `bachecheRoutes`

### Documentazione

#### `pg_backend/TODO.md`
- Fase 4 segnata come completata ✅

#### `pg_backend/DOCUMENTAZIONE.md`
- `bacheca.service.ts`: aggiornato a ✅
- Fase 4 tabella: ❌ → ✅
- Dettaglio API Fase 4 rimosso da "Da implementare"
- Auth endpoint bacheca aggiornato con ruoli esatti

## Backend Corsi (Fase 3) + fix getApiUrl — 14/05/2026

**Modifica:** Implementato backend CRUD Corsi (service, controller, validators, routes) con 5 endpoint. Fixato bug `getApiUrl` senza parentesi in 2 service frontend.

### Bug fix

#### `pg_frontend/src/app/core/services/bacheca.ts`
- `getApiUrl` → `getApiUrl()` (mancavano le parentesi, restituiva la funzione invece del valore)

#### `pg_frontend/src/app/core/services/documento.ts`
- Stesso fix: `getApiUrl` → `getApiUrl()`

### Backend — nuovi file

#### `pg_backend/src/services/corsi.service.ts`
- `getCorsi(docenteId?)` — lista corsi con filtro opzionale per docente
- `getCorsoById(id)` — dettagli con docente incluso
- `createCorso(data)` — creazione con mapping camelCase → snake_case
- `updateCorso(id, data)` — modifica parziale (solo campi forniti)
- `deleteCorso(id)` — elimina in cascata FAQ e bacheca associate

#### `pg_backend/src/controllers/corsi.controller.ts`
- 5 handler HTTP: `getCorsi`, `getCorsoById`, `createCorso` (201), `updateCorso`, `deleteCorso` (204)
- Gestione errori: 404 se corso non trovato, 500 per errori interni

#### `pg_backend/src/routes/corsi.routes.ts`
- `GET /api/corsi` — pubblico (filtro `?docenteId=`)
- `GET /api/corsi/:id` — pubblico
- `POST /api/corsi` — JWT + authorize(DOCENTE, AMMINISTRATORE)
- `PUT /api/corsi/:id` — JWT + authorize(DOCENTE, AMMINISTRATORE)
- `DELETE /api/corsi/:id` — JWT + authorize(DOCENTE, AMMINISTRATORE)

#### `pg_backend/src/validators/corsi.validators.ts`
- `creaCorsoSchema` — nomeCorso, anno (2000-2100), cfu (1-30), idDocente
- `modificaCorsoSchema` — tutti opzionali
- `corsiFiltriSchema` — query `?docenteId=` opzionale

### Backend — file modificati

#### `pg_backend/src/app.ts`
- Importate e registrate `corsiRoutes` su `/api`

### Documentazione

#### `pg_backend/TODO.md`
- Fase 3 segnata come completata ✅

#### `pg_backend/DOCUMENTAZIONE.md`
- `corsi.service.ts`: aggiornato a ✅
- `corsi.validators.ts`: aggiornato a ✅
- Fase 3 tabella: ❌ → ✅
- Tabella endpoint spostata da "Da implementare" a "✅ Fase 3 completata"
- Dettaglio API Fase 3 rimosso dalla sezione "Da implementare"

## Setup DB cross-platform — setup-db.js, diagnostica PostgreSQL, README/TODO/DOC

**Data:** 11/05/2026

**Modifica:** Sostituito lo script bash `setup-db.sh` con un equivalente Node.js cross-platform (`setup-db.js`) che funziona nativamente su Windows, Linux e macOS. Aggiunta diagnostica avanzata per errori di connessione PostgreSQL con hint specifici per piattaforma. Aggiornati README, TODO e DOCUMENTAZIONE.

### File creati

#### `pg_backend/setup-db.js`
- Script Node.js cross-platform che usa il modulo `pg` per connettersi a PostgreSQL
- Rilevamento del servizio PostgreSQL specifico per OS:
  - **Windows**: `sc query` per trovare servizi "postgres", mostra stato (esecuzione/fermo)
  - **macOS**: `brew services list`
  - **Linux**: `pg_isready` + `systemctl is-active`
- Tentativo di connessione con fallback su più DB di manutenzione (`postgres` → `template1` → DB target)
- Diagnostica errori PostgreSQL decodificati per codice:
  - `28P01` → autenticazione fallita, suggerisce fix `pg_hba.conf`
  - `ECONNREFUSED` → PostgreSQL non in ascolto, mostra comandi di debug
  - `ENOTFOUND` → host irraggiungibile, suggerisce `127.0.0.1` su Windows (IPv6)
- Hint specifici per Windows: percorso `pg_hba.conf`, comando `netstat`, link download

### File modificati

#### `pg_backend/README.md`
- Aggiunta sezione setup cross-platform: `node setup-db.js` come metodo primario
- Aggiunto comando Windows per avviare PostgreSQL: `net start postgresql-<versione>`
- Script di setup ora documenta 6 passi (inclusi check prerequisiti e lettura `.env`)
- Aggiunti `node setup-db.js` e `./setup-db.sh` nella tabella comandi utili
- Sezione reset aggiornata per usare `node setup-db.js`

#### `pg_backend/TODO.md`
- Aggiunti 4 task per la Fase 8 (Amministratore):
  - Aggiustare scritte non visibili nei form
  - Gestione prenotazioni admin (elimina/modifica)
  - Blocco giorni calendario (festivi)
  - Rimuovere cambio ruolo utenti

#### `pg_backend/DOCUMENTAZIONE.md`
- Aggiunto `setup-db.js` nella struttura del progetto
- Nuova sottosezione "Script di setup automatico" con tabella comparativa (bash vs Node.js)
- Documentata diagnostica avanzata di `setup-db.js` (rilevamento servizio, codici errore, hint Windows)
- Aggiornata tabella TODO finale: Fase 1 include `setup-db.js`, Fase 8 passa a `🔄`
- Aggiunta lista task aggiuntivi Fase 8

---

## Fix navigazione attiva home — IntersectionObserver mancante

**Data:** 10/05/2026

**Modifica:** Aggiunto `IntersectionObserver` in `HomePage` per aggiornare dinamicamente la sezione attiva del menu durante lo scroll manuale (mancava l'implementazione nonostante fosse documentata in CHANGES.md). Risolto il bug per cui cliccando una sezione a volte non veniva evidenziata.

### File modificati

#### `pg_frontend/src/app/features/home/home.page.ts`
- Aggiunti `AfterViewInit`, `ChangeDetectorRef`, `inject` agli import
- Implementato `ngAfterViewInit()` con `IntersectionObserver` che osserva le sezioni `section[id]` e aggiorna `activeSection` quando una sezione entra nel viewport centrale (`rootMargin: '-40% 0px -55% 0px'`)
- Iniettato `ChangeDetectorRef` per forzare il rilevamento delle modifiche all'attivazione della sezione

---

## Admin CRUD — gestione utenti e slot globali

**Data:** 10/05/2026

**Modifica:** Implementate API backend e pagine frontend per la gestione completa degli utenti (CRUD su studenti, docenti, amministratori) e la visualizzazione globale degli slot di ricevimento da pannello admin.

### Backend — nuovi file

#### `pg_backend/src/validators/admin.validators.ts`
- `creaUtenteSchema` — validazione creazione utenti con campo `ruolo` e campi condizionali per tipo
- `modificaUtenteSchema` — validazione modifica (tutti i campi opzionali)
- `slotFiltriSchema` — validazione filtri query per slot globali

### Backend — file modificati

#### `pg_backend/src/services/admin.service.ts`
- Aggiunte interfacce `UtenteUnificato`, `SlotGriglia`
- `getAllUsers(ruolo?)` — query parallele su Studente/Docente/Amministratore, unifica con campo `ruolo`
- `createUser(data)` — creazione nella tabella giusta in base a `data.ruolo`, con hash password e check email duplicata
- `updateUser(id, data)` — ricerca utente su tutte le tabelle, update campi forniti
- `deleteUser(id)` — elimina da tabella corretta (cascade prenotazioni per studenti)
- `getSlotGlobali(filtri?)` — lista slot con join a Docente e Luogo, filtri per docente/data/stato
- Helper `trovaUtentePerId(id)` — cerca su tutte e 3 le tabelle per ID

#### `pg_backend/src/controllers/admin.controller.ts`
- Aggiunti handler: `getUtenti`, `creaUtente`, `modificaUtente`, `eliminaUtente`, `getSlotGlobali`

#### `pg_backend/src/routes/admin.routes.ts`
- Aggiunte routes: `GET /admin/utenti`, `POST /admin/utenti`, `PUT /admin/utenti/:id`, `DELETE /admin/utenti/:id`, `GET /admin/slot`

### Frontend — file modificati

#### `pg_frontend/src/app/core/services/admin.ts`
- Aggiunte interfacce: `UtenteUnificato`, `CreaUtenteRequest`, `SlotGriglia`, `FiltriSlot`
- Aggiunti metodi: `getUtenti(ruolo?)`, `creaUtente(dati)`, `modificaUtente(id, dati)`, `eliminaUtente(id)`, `getSlotGlobali(filtri?)`

### Frontend — file riscritti

#### `pg_frontend/src/app/features/admin/gestione-utenti/`
- Tabella utenti con colonne: Ruolo (con badge colorato), Nome, Email, Dettagli, Azioni
- Chip filtro: Tutti / Studenti / Docenti / Admin
- Barra di ricerca con debounce (nome/email/matricola)
- Modale creazione/modifica con campi dinamici in base al ruolo
- Bottone elimina con conferma

#### `pg_frontend/src/app/features/admin/gestione-slot-admin/`
- Card filtri: select docente, select data, select stato
- Griglia slot card con: docente, data, ora, aula, stato, conteggio prenotazioni
- Stile coerente con Dashboard (border-radius 18px, ombre, palette blue)

---

## Fix minori — form admin, compilazione TS, stili input

**Data:** 10/05/2026

**Modifica:** Risolti problemi di visibilità del testo negli `ion-input`/`ion-select` delle pagine admin (mancavano `--color` e `--placeholder-color`). Corretti errori TypeScript nel backend (`exactOptionalPropertyTypes`, casting `req.params`, tipi Date). Puliti import inutilizzati nel frontend.

### File modificati

#### `pg_frontend/src/app/features/admin/gestione-utenti/gestione-utenti.page.scss`
- Aggiunti `--color: #0f172a`, `--placeholder-color: #94a3b8`, `--placeholder-opacity: 1` agli `ion-input` e `ion-select` del modale

#### `pg_frontend/src/app/features/admin/gestione-slot-admin/gestione-slot-admin.page.scss`
- Aggiunti `--color: #0f172a`, `--placeholder-color: #94a3b8`, `--placeholder-opacity: 1` agli `ion-select` dei filtri

#### `pg_backend/src/services/admin.service.ts`
- `trovaUtentePerId()`: tipizzato `user` come `any` per evitare conflitto tra tipi Prisma diversi
- `getSlotGlobali()`: helper `fmtDate`/`fmtTime` per gestire Date in modo sicuro

#### `pg_backend/src/controllers/admin.controller.ts`
- `req.params.id` castato a `string` per Express 5
- Filtri slot costruiti con oggetto parziale per `exactOptionalPropertyTypes`

#### `pg_frontend/src/app/features/admin/gestione-utenti/gestione-utenti.page.ts`
- Rimosso `IonList`, `IonSpinner` (inutilizzati); aggiunto `IonButtons`

#### `pg_frontend/src/app/features/admin/gestione-slot-admin/gestione-slot-admin.page.ts`
- Rimossi `IonItem`, `IonList`, `IonDatetime`, `IonChip`, `IonSpinner`, `IonButton` (inutilizzati)

---

## Fix login admin — normalizzazione ruolo e redirect

**Data:** 10/05/2026

**Modifica:** Risolto il login per l'utente amministratore: il ruolo `AMMINISTRATORE` (uppercase) restituito dal backend veniva confrontato con `amministratore` (lowercase) atteso dal frontend, causando il fallimento dei `roleGuard` e il redirect errato a `/studente/dashboard`. Aggiunta normalizzazione in lowercase nel `AuthService` e redirect dedicato nella login page.

### File modificati

#### `pg_frontend/src/app/core/services/auth.ts`
- `login()`: aggiunto `session.role = session.role.toLowerCase()` nel `tap` dopo la risposta HTTP, per normalizzare il ruolo uppercase del backend in lowercase usato dal frontend
- `loadSessionFromStorage()`: stessa normalizzazione per sessioni già salvate in localStorage

#### `pg_frontend/src/app/features/auth/login/login.page.ts`
- Aggiunto redirect `role === 'amministratore' → '/dashboard-admin'` nel ramo `next()` di `effettuaLogin()`

---

## Admin Dashboard + navigazione segmenti

**Data:** 10/05/2026

**Modifica:** Implementata la Dashboard Admin con statistiche mock e navigazione a segment condivisa tra le 3 pagine admin.

### File modificati

#### `pg_frontend/src/app/core/services/admin.ts`
- Aggiunta interfaccia `AdminStats` (totaleStudenti, totaleDocenti, totalePrenotazioni, slotAttivi, prenotazioniOggi, utentiNuoviMese)
- Implementato metodo `getStatistiche()` con dati mock (Observable)

#### `pg_frontend/src/app/features/admin/dashboard-admin/dashboard-admin.page.ts`
- Riscritto completamente con import di segment, card, icon, button, routerLink
- Iniettato `Admin` service per caricare le statistiche
- Aggiunta proprietà `activeSegment = 'dashboard'`

#### `pg_frontend/src/app/features/admin/dashboard-admin/dashboard-admin.page.html`
- Header con titolo "Dashboard Admin"
- Segment toolbar con 3 voci: Dashboard, Gestione Utenti, Slot (con routerLink)
- Griglia di 6 stat-card con icona circolare, numero e label
- Sezione "Azioni rapide" con bottoni

#### `pg_frontend/src/app/features/admin/dashboard-admin/dashboard-admin.page.scss`
- Stile coerente con la home page (stessa palette, border-radius, ombre)
- Segment identico a quello auth della home
- Stat card: `border-radius: 18px`, `box-shadow`, icona 54px circolare con sfondo colorato
- Colori differenziati per ogni statistica
- Responsive: 3 → 2 → 1 colonne

#### `pg_frontend/src/app/features/admin/gestione-utenti/gestione-utenti.page.ts`
- Aggiunti import per segment, routerLink, icon
- Aggiunta proprietà `activeSegment = 'utenti'`

#### `pg_frontend/src/app/features/admin/gestione-utenti/gestione-utenti.page.html`
- Sostituito stub con header + segment toolbar uguale alla dashboard
- Contenuto placeholder "Prossimamente"

#### `pg_frontend/src/app/features/admin/gestione-utenti/gestione-utenti.page.scss`
- Stili per segment toolbar e placeholder

#### `pg_frontend/src/app/features/admin/gestione-slot-admin/gestione-slot-admin.page.ts`
- Aggiunti import per segment, routerLink, icon
- Aggiunta proprietà `activeSegment = 'slot'`

#### `pg_frontend/src/app/features/admin/gestione-slot-admin/gestione-slot-admin.page.html`
- Sostituito stub con header + segment toolbar uguale alla dashboard
- Contenuto placeholder "Prossimamente"

#### `pg_frontend/src/app/features/admin/gestione-slot-admin/gestione-slot-admin.page.scss`
- Stili per segment toolbar e placeholder

---

## Admin service collegato a API reale + backend admin endpoint

**Data:** 10/05/2026

**Modifica:** Sostituiti i dati mock del servizio Admin con chiamate HTTP reali al backend. Creato endpoint `GET /api/admin/stats` nel backend.

### Backend (pg_backend) — nuovi file

#### `pg_backend/src/services/admin.service.ts`
- Funzione `getStats()` che esegue query Prisma parallele per contare: studenti, docenti, prenotazioni totali, slot attivi, prenotazioni di oggi

#### `pg_backend/src/controllers/admin.controller.ts`
- Handler `getStats` che chiama il service e restituisce JSON

#### `pg_backend/src/routes/admin.routes.ts`
- Rotta `GET /api/admin/stats` protetta da `authenticate` + `authorize('AMMINISTRATORE')`

#### `pg_backend/src/middleware/authorize.ts`
- Nuovo middleware `authorize(...ruoli)` che controlla il ruolo dal JWT e restituisce 403 se non autorizzato

#### `pg_backend/src/app.ts`
- Registrate le rotte admin

### Frontend (pg_frontend) — file modificati

#### `pg_frontend/src/app/core/services/admin.ts`
- Rimosso `of` da rxjs, aggiunto `HttpClient`
- `getStatistiche()` ora chiama `this.http.get<AdminStats>('api/admin/stats')` (l'interceptor gestisce base URL e token)
- Rimosso `utentiNuoviMese` dall'interfaccia (non presente nello schema DB)

#### `pg_frontend/src/app/features/admin/dashboard-admin/dashboard-admin.page.ts`
- Rimossa card "Nuovi utenti (mese)" dal template
- Rimossa icona `logInOutline` non utilizzata
- Inizializzazione stats senza `utentiNuoviMese`

#### `pg_frontend/src/app/features/admin/dashboard-admin/dashboard-admin.page.html`
- Rimossa la sesta stat-card (nuovi utenti) — ora griglia 5 card

---

## Fix interceptor HTTP — base URL e gestione URL assoluti/relativi

**Data:** 10/05/2026

**Modifica:** Corretto l'interceptor per puntare alla porta corretta del backend (5000 invece di 3000) e gestire correttamente sia URL assoluti che relativi.

### File modificati

#### `pg_frontend/src/app/core/interceptors/auth-interceptor.ts`
- `baseUrl` cambiato da `https://localhost:3000` a `http://localhost:5000`
- Aggiunto controllo `isAbsolute` per non prependere baseUrl se l'URL è già assoluto (es. usato da `AuthService.setURL()`)
- Aggiunto `req.url.replace(/^\//, '')` per evitare doppi slash quando l'URL inizia con `/`

---

---

## Admin Segnalazioni — backend API + frontend pagina gestione

**Data:** 14/05/2026

**Modifica:** Implementata la gestione delle segnalazioni per l'amministratore: CRUD backend completo (service, controller, validators, routes) e pagina frontend admin con tabella, filtri per stato e cambio stato inline.

### Backend — nuovi file

#### `pg_backend/src/services/segnalazioni.service.ts`
- `createSegnalazione(data)` — crea segnalazione con validazione studente esistente
- `getSegnalazioniByStudente(matricola)` — lista dello studente
- `getAllSegnalazioni(stato?)` — tutte con join su studente, filtro opzionale `?stato=`
- `aggiornaStatoSegnalazione(id, stato)` — cambio stato con validazione (APERTA/IN_LAVORAZIONE/CHIUSA)

#### `pg_backend/src/validators/segnalazioni.validators.ts`
- `creaSegnalazioneSchema` — oggetto, descrizione, matricola_studente obbligatori
- `aggiornaStatoSchema` — stato in `['APERTA', 'IN_LAVORAZIONE', 'CHIUSA']`

### Backend — file modificati

#### `pg_backend/src/controllers/segnalazioni.controller.ts`
- Riscritto con 4 handler: `createSegnalazione`, `getSegnalazioniByStudente`, `getAllSegnalazioni`, `aggiornaStatoSegnalazione`

#### `pg_backend/src/routes/segnalazioni.routes.ts`
- `POST /api/segnalazioni` — crea segnalazione (autenticato)
- `GET /api/segnalazioni/studente/:matricola` — segnalazioni studente (autenticato)
- `GET /api/segnalazioni/admin/all` — tutte con filtro `?stato=` (admin)
- `PATCH /api/segnalazioni/:id/stato` — cambia stato (admin)

#### `pg_backend/src/app.ts`
- Registrate le rotte `segnalazioniRoutes`

### Frontend — nuovi file

#### `pg_frontend/src/app/features/admin/gestione-segnalazioni/`
- Componente standalone con tabella segnalazioni, chip filtro (Tutte/Aperte/In lavorazione/Chiuse)
- Badge colorati per stato, select inline per cambio stato
- Stile coerente con le altre pagine admin

### Frontend — file modificati

#### `pg_frontend/src/app/core/services/segnalazione.ts`
- URL relativi via interceptor (rimossa dipendenza da `AuthService.getApiUrl()`)
- `getAllSegnalazioni(stato?)` — parametro `?stato=` opzionale
- `Segnalazione` interface estesa con `studente?` per response admin

#### `pg_frontend/src/app/app.routes.ts`
- Aggiunta rotta `/gestione-segnalazioni` con `authGuard` + `roleGuard('amministratore')`

#### `pg_frontend/src/app/components/topbar/topbar.component.ts`
- Rimosso link hardcodato a `/segnalazione` (rotta studente) nel menu mobile
- Registrata icona `flag-outline` in `addIcons`

#### Pagine admin (4 file):
- `dashboard-admin.page.ts`, `gestione-utenti.page.ts`, `gestione-slot-admin.page.ts`, `dashboard-layout.component.ts`
- Aggiunta voce menu "Segnalazioni" con icona `flag-outline`

### Bug fix

#### `pg_frontend/src/app/features/admin/gestione-slot-admin/gestione-slot-admin.page.ts`
- Aggiunto import mancante `ActivatedRoute` da `@angular/router`
- Dichiarate proprietà mancanti della classe (`slot`, `docenti`, `dateDisponibili`, filtri, modale)
- Aggiunti import Ionic mancanti (`IonModal`, `IonHeader`, `IonToolbar`, `IonTitle`, `IonButtons`, `IonContent`)

---

## Pianificazione Blocca Giorni — documentata Fase 11

**Data:** 14/05/2026

**Modifica:** Documentato il piano di implementazione per la funzionalità "Blocca giorni dal calendario (festivi)" in DOCUMENTAZIONE.md e TODO.md. Aggiunta Fase 11 in TODO.md con piano dettagliato di backend e frontend. Da implementare al prossimo sessione di lavoro.

### File modificati

#### `pg_backend/DOCUMENTAZIONE.md`
- Aggiunta sezione "Blocca giorni — Piano implementazione" con modello DB, backend API, frontend, rotte, menu, e riepilogo file

#### `pg_backend/TODO.md`
- Aggiunta Fase 11 — Blocca giorni (Pianificato) con 5 task
- Aggiunto piano dettagliato con specifiche tecniche per ogni file
- Riferimento incrociato dalla Fase 8 alla Fase 11

---

---

## Refactor CorsoDiStudi + allineamento backend/frontend + fix vari — 16/05/2026

**Modifica:** Refactor del database e del codice per sostituire `corso_di_studi` come campo testuale su Docente/Studente con una entità `CorsoDiStudi` autonoma. Aggiornati servizi backend, interfacce e componenti frontend. Aggiunte feature mancanti nella pagina admin segnalazioni e fixata la compilazione SCSS.

### Database — schema modificato

#### `prisma/schema.prisma`
- **Nuovo modello `CorsoDiStudi`**: `id_corso_di_studi` (UUID), `nome`, `descrizione?`
- **Nuova tabella join `DocenteCorsoDiStudi`**: relazione molti-a-molti tra Docente e CorsoDiStudi
- **`Docente`**: rimossi campi `materia` (String) e `corso_di_studi` (String) — ora derivati da relazioni
- **`Bacheca`**: `id_corso` (FK verso Corso) → `id_corso_di_studi` (FK verso CorsoDiStudi)
- **`Studente`**: `corso_di_studi` (String) → FK `id_corso_di_studi` verso CorsoDiStudi

#### Migrazione: `20260516143900_add_corso_di_studi_entity`
- Creata tabella `CorsoDiStudi`, tabella join `DocenteCorsoDiStudi`
- Aggiunta FK `id_corso_di_studi` su `Studente`, rimossa colonna `corso_di_studi`
- Modificata FK `Bacheca.id_corso_di_studi`
- Migrazioni precedenti consolidate (rimosse 3 vecchie dal tracking git)

#### `prisma/seed.ts`
- Riscritto: ora crea 3 `CorsoDiStudi` (Informatica, Ingegneria, Matematica)
- Docenti associati a CorsoDiStudi via `DocenteCorsoDiStudi`
- Studenti assegnati a CorsoDiStudi via FK `id_corso_di_studi`
- Bacheche collegate a CorsoDiStudi invece che a Corso

### Backend — servizi modificati

#### `docenti.service.ts`
- `getDocenti(filtro?)`: filtro per nome CorsoDiStudi via `corsi_di_studi.some.corso_di_studi.nome` (anziché campo diretto)
- `materia` derivata da `docente.corsi[0]?.nome_corso`

#### `prenotazioni.service.ts`
- Aggiunte funzioni helper: `fmtLuogo()` (restituisce "Aula 5, Edificio D (Primo piano)"), `mapLuogoRicevimento()` (oggetto completo con id/aula/edificio/piano/coordinate)
- Tutte le response (createPrenotazione, getPrenotazioniStudente, getPrenotazioneById, getPrenotazioniDocente, aggiornaStatoPrenotazione) ora includono `luogo` (stringa formattata) e `luogoRicevimento` (oggetto)

#### `admin.service.ts`
- `createUser`: supporta `corsoDiStudiId` per nuovi studenti
- `updateUser`: aggiorna `corsoDiStudiId` su Studente
- `deleteUser`: invariato

#### `auth.service.ts`
- `createStudente`: cerca CorsoDiStudi per `id` o `nome`, lancia 400 se non trovato
- `getProfile`: restituisce `corsoDiStudi?: { nome, id }`
- `createDocente`: associa ai CorsoDiStudi selezionati

#### `studenti.service.ts`
- `getStudente`: restituisce `corsoDiStudi` (oggetto annidato) + `corsoDiStudiId`

#### `bacheca.service.ts`
- `getBachecaByCorsoDiStudi(idCorsoDiStudi)`: cerca per `id_corso_di_studi` (anziché `id_corso`)
- `updateBacheca(idCorsoDiStudi, data)`: aggiorna per CorsoDiStudi

#### `corsi.service.ts`
- `deleteCorso`: rimosso `bacheca.deleteMany()` (la bacheca ora appartiene a CorsoDiStudi, non a Corso)

### Frontend — interfacce e servizi

#### `core/models/interfacce.ts`
- Aggiunta interfaccia `CorsoDiStudi`: `idCorsoDiStudi`, `nome`, `descrizione?`
- `Studente`: aggiunto `corsoDiStudiId`, `corsoDiStudi` oggetto annidato
- `Bacheca`: `idCorso` → `idCorsoDiStudi`

#### `core/services/bacheca.ts`
- `getBachecaPerCorso(idCorso)` → `getBachecaPerCorsoDiStudi(idCorsoDiStudi)`, URL cambiato da `/bacheche/corso/:idCorso` a `/bacheche/corso-di-studi/:idCorsoDiStudi`
- `updateBachecaPerCorso(idCorso, data)` → `updateBachecaPerCorsoDiStudi(idCorsoDiStudi, data)`

#### `dashboard-studente.page.ts`, `bacheca-studente.page.ts`
- Chiamano `getBachecaPerCorsoDiStudi(corsoDiStudiId)` invece della vecchia API

### Admin segnalazioni — feature aggiunte

#### `gestione-segnalazioni.page.ts`
- Aggiunto `AlertController` import
- Metodo `dettagli(s)`: mostra alert con oggetto, descrizione, studente, matricola, email, data, stato
- Metodo `elimina(s)`: alert di conferma → chiama `eliminaSegnalazione(id)`

#### `gestione-segnalazioni.page.html`
- Colonna azioni ora include bottoni "Dettagli" (icona `information-circle-outline`) ed "Elimina" (icona `trash-outline`, con conferma)

#### `gestione-segnalazioni.page.scss`
- Aggiunti stili `.action-group` (flex row), `.btn-icon` (36x36, border, hover effetto), `.btn-danger` (hover rosso)

### CSS — fix vari

#### `global.scss`
- **Fix nesting invalido**: `:root { ... }` annidato dentro `.premium-form-field` spostato al `:root` globale (il nesting era SCSS valido ma selettore `.premium-form-field :root` non matchava mai, rendendo le variabili CSS inutilizzabili in contesto globale)
- **Rimosso** `@import "@ionic/angular/css/flex-utils.css"` (deprecato, non più presente nella CLI Ionic 7+)
- **Rimosso** `body { font-family, background-color, color, transition }` (duplicato da Ionic CSS variables)

---

## Fix navigazione admin, dark mode completa, logout funzionante, theme toggle — 16/05/2026

**Modifica:** Risolti molteplici bug di navigazione e UI sulle pagine admin e componenti condivisi. Implementata dark mode completa per tutte le pagine admin (dashboard, utenti, slot, segnalazioni, calendario) e per i componenti sidebar/topbar. Aggiunto theme toggle su sidebar e topbar. Fixato logout (sidebar e topbar pulivano solo la rotta senza chiamare `auth.logout()`). Fixato pulsante admin nella topbar (puntava sempre a `/profilo-studente`). Aggiunto error handler mancante in `caricaDocenti()` e flag di caricamento per risolvere race condition con `ion-select`.

### Frontend — componenti condivisi

#### `sidebar.component.html`
- Sostituito `<a routerLink="/login">` con `<a (click)="logout()">` — ora chiama `auth.logout()` prima di navigare
- Aggiunto pulsante `sidebar-theme-toggle` con icona sole/luna per cambiare tema

#### `sidebar.component.ts`
- Iniettato `AuthService`, aggiunta proprietà `isDarkMode` letta da `document.body.classList`
- Metodo `toggleDarkMode()`: toggla classe `.dark` su `body` + salva in `localStorage`
- Metodo `logout()`: chiama `this.auth.logout()` + naviga a `/login`

#### `sidebar.component.scss`
- Stili `.sidebar-theme-toggle`: dimensioni, colori, hover effetto, transizione

#### `topbar.component.html`
- Sostituito `<a routerLink="/login">` con `<a (click)="logout(); chiudiMenu()">` per il logout mobile
- Sostituito `<div ... routerLink="/profilo-studente">` con `<div (click)="vaiAlProfilo()">` — ora naviga in base al ruolo
- Aggiunto pulsante `.theme-toggle` con icona sole/luna

#### `topbar.component.ts`
- Iniettato `Router`, aggiunta proprietà `isDarkMode`
- Metodo `toggleDarkMode()`: stesso comportamento della sidebar
- Metodo `vaiAlProfilo()`: naviga a `/dashboard-admin` per admin, `/profilo-docente` per docente, `/profilo-studente` per studente
- Metodo `logout()`: chiama `auth.logout()` + naviga a `/login`

#### `topbar.component.scss`
- Stili `.theme-toggle`: 46x46, bordo, hover, icona centrata

### Frontend — admin pages

#### `gestione-utenti.page.ts`
- `formVuoto()`: aggiunto campo `corsoDiStudi: ''` (mancante causava errore a runtime nella creazione studente)

#### `gestione-slot-admin.page.ts`
- Aggiunta proprietà `docentiCaricati = false` per tracciare stato caricamento docenti
- `caricaDocenti()`: aggiunto error handler (mancante), setta `docentiCaricati = true` in next e error
- `apriModaleCrea()`: ora chiama `caricaDocenti()` prima di aprire la modale per evitare race condition (primi due click sul select docente mostravano zero opzioni perché `ion-select` caching gli `ion-select-option` prima che `@for` li renderizzasse)

#### `app.routes.ts`
- `dettaglio-prenotazione/:id`: decommentato `canActivate: [authGuard, roleGuard('studente')]` (era stato commentato per debug)

### Frontend — dark mode admin completa

#### `theme/variables.scss`
Aggiunte sezioni `body.dark` per:

- **Overlay e backdrop**: `--ion-overlay-background-color: #1e293b`, `--ion-backdrop-color: #000000`
- **Topbar dark**: stili `.menu-toggle`, `.notification-button`, `.theme-toggle`, `.student-profile-mini`, `.student-avatar-small`
- **Sidebar dark**: stili `.sidebar-logo`, `.sidebar-nav a` (hover + active con box-shadow), `.sidebar-theme-toggle`
- **Mobile menu dark**: stili `.mobile-top-menu`, `.drawer-header`, `.menu-items a`
- **Input/select dark**: `--placeholder-color`, `--placeholder-opacity`, `color` per ion-select, ion-input, ion-textarea, ion-label, `.premium-form-field label`, `.premium-form-field ion-item`
- **Admin dashboard**: `.stat-card` (background, border, shadow), `.quick-actions h3`
- **Admin tables**: `.table-wrap`, `.utenti-table`, `.segnalazioni-table`, `.calendario-table` (th, td, tr:hover)
- **Admin chips/search**: `ion-chip`, `.count-badge`, `.search-bar`
- **Admin page titles**: `.page-title`, `.selected-day-label`
- **Calendar admin**: `ion-datetime` (background, wheel-fade, calendar-day colors)
- **Slot page**: `.filtri-card`, `.slot-card`, `.slot-header`, `.slot-docente`, `.slot-info`, `.slot-empty`, `.stato-libero`, `.stato-occupato`
- **Segnalazioni badges**: `.stato-aperta`, `.stato-in_lavorazione`, `.stato-chiusa`, `.ruolo-studente`, `.ruolo-docente`, `.ruolo-amministratore`, `.motivo-badge`, `.data-badge`
- **Field groups modali**: `.field-group` (background, label, ion-input/select/toggle), `.luogo-section`, `.filtro-group`
- **Modal header**: `ion-modal ion-header ion-toolbar`
- **Icon buttons admin**: `.btn-icon`, `.btn-danger`, `.icon-btn.edit`, `.icon-btn.delete`
- **Segnalazioni page**: `.oggetto-cell p`, `.studente-cell .matricola`, `.stato-select`
- **Admin stat icons**: `.student-icon`, `.teacher-icon`, `.booking-icon`, `.slot-icon`, `.today-icon`, `.new-icon`

### Select interfaces — dark mode (alert/popover)

#### `theme/variables.scss`
- **ion-alert**: `.alert-wrapper` background, `.alert-head h2/h3`, `.alert-message`, `.alert-radio-group`, `.alert-radio-button`, `.alert-radio-label`, `.alert-radio-icon`, `.alert-radio-inner`, `.alert-button-group`, `.alert-button`
- **ion-popover**: background, color, `ion-list/ion-item/ion-radio-group` + `::part(native)`

### Frontend — altro

#### `main.ts`
- Aggiunta icona `flagOutline` alla registrazione `addIcons` (mancante causava icona vuota nel menu admin)

#### `global.scss`
- Spostate variabili CSS globali (`--primary-blue`, `--text-dark`, etc.) da selector annidato `.premium-form-field :root` a `:root` globale — il selettore annidato non matchava mai

---

# ✅ Completato

Tutte le fasi A–E sono state implementate in questo changeset.
