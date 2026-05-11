# CHANGES

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

# ✅ Completato

Tutte le fasi A–E sono state implementate in questo changeset.
