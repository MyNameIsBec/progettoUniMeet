# CHANGES

## Navigazione attiva nel menu (home page)

**Data:** 10/05/2026

**Modifica:** I link del menu di navigazione nella home page ora si evidenziano in blu dinamicamente in base alla sezione visibile nello scroll, invece di avere solo "Home" fissa come attiva.

### File modificati

#### `pg_frontend/src/app/features/home/home.page.ts`
- Aggiunto `AfterViewInit`, `ChangeDetectorRef`, `inject` agli import
- Aggiunta proprietà `activeSection: string = 'home'`
- Iniettato `ChangeDetectorRef` tramite `inject()`
- Implementato `ngAfterViewInit()` con `IntersectionObserver` che osserva le sezioni `[id]` e aggiorna `activeSection` quando una sezione entra nel viewport (con rootMargin al 50% per rilevare la sezione centrale)

#### `pg_frontend/src/app/features/home/home.page.html`
- Aggiunto `[class.active]="activeSection === '<id>'"` a ciascun link del menu (`Home`, `Funzionalità`, `Come funziona`, `Accedi`, `Contatti`)

#### `pg_frontend/src/app/features/home/home.page.scss`
- Sostituito `.desktop-nav a:first-child` con `.desktop-nav a.active` (stessi stili: colore `#2563eb` e bordo inferiore blu di 3px)

#### `pg_frontend/angular.json`
- Aumentato il budget `anyComponentStyle` da 2kb/4kb a 8kb/12kb (il file SCSS della home page era già oltre il limite precedente)

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

# TO DO

## Fase A — Backend: API Gestione Utenti

Endpoint da aggiungere in `admin.routes.ts` (protetti da `authenticate` + `authorize('AMMINISTRATORE')`):

| Endpoint | Descrizione |
|----------|-------------|
| `GET /api/admin/utenti` | Lista unificata di tutti gli utenti (studenti + docenti + admin) con filtro ruolo opzionale |
| `POST /api/admin/utenti` | Creazione utente (studente/docente/admin) |
| `PUT /api/admin/utenti/:id` | Modifica utente (nome, email, ecc.) |
| `DELETE /api/admin/utenti/:id` | Eliminazione utente |

File da modificare:
- `pg_backend/src/services/admin.service.ts` — metodi `getAllUsers()`, `createUser()`, `updateUser()`, `deleteUser()`
- `pg_backend/src/controllers/admin.controller.ts` — handlers corrispondenti
- `pg_backend/src/routes/admin.routes.ts` — nuove routes

## Fase B — Backend: API Gestione Slot Admin

| Endpoint | Descrizione |
|----------|-------------|
| `GET /api/admin/slot` | Lista slot globali con filtri (docente, data, stato) |

## Fase C — Frontend: Servizio `Admin`

Metodi da aggiungere a `pg_frontend/src/app/core/services/admin.ts`:

- `getUtenti(ruolo?)` — lista utenti
- `creaUtente(dati)` — crea utente
- `modificaUtente(id, dati)` — modifica utente
- `eliminaUtente(id, ruolo)` — elimina utente
- `getSlotGlobali(filtri?)` — lista slot globali

## Fase D — Frontend: Pagina Gestione Utenti

Partendo dal placeholder in `pg_frontend/src/app/features/admin/gestione-utenti/`:
- Segment per filtrare: Tutti / Studenti / Docenti / Admin
- Barra di ricerca per nome/email/matricola
- Tabella/lista utenti con azioni modifica/elimina
- Bottone "Crea utente" con form dinamico
- Stile coerente con la Dashboard

## Fase E — Frontend: Pagina Gestione Slot Admin

Partendo dal placeholder in `pg_frontend/src/app/features/admin/gestione-slot-admin/`:
- Filtri: select docente, date picker, select stato
- Lista slot con docente, data, ora, aula, stato
- Possibilità di modificare/annullare slot
