# Backend Prenotazioni Ricevimento — Documentazione

## Struttura del progetto

```
pg_backend/
├── prisma/
│   ├── schema.prisma          # Modelli del database (Prisma)
│   ├── migrations/            # Migrazioni PostgreSQL
│   └── seed.ts                # Script dati di test
├── src/
│   ├── prisma/
│   │   └── client.ts          # Istanza PrismaClient condivisa
│   ├── validators/            # Schemi di validazione (express-validator)
│   ├── controllers/           # Gestori delle richieste HTTP
│   ├── services/              # Logica di business
│   ├── routes/                # Endpoint HTTP
│   ├── middleware/
│   │   ├── authenticate.ts    # Middleware JWT (protegge le rotte)
│   │   └── authorize.ts       # Middleware ruoli (controlla il ruolo dal JWT)
│   ├── app.ts                 # Configurazione Express
│   └── server.ts              # Entry point del server
├── prisma.config.ts           # Configurazione Prisma (datasource URL)
├── setup-db.sh                # Script automatizzato setup DB (Unix)
├── setup-db.js                # Script automatizzato setup DB (cross-platform)
├── dist/                      # JS compilato (generato da tsc, ignorato)
├── README.md                  # Istruzioni setup DB locale
├── DOCUMENTAZIONE.md
└── package.json
```

---

## Architettura a strati

```
Richiesta HTTP
     │
     ▼
   Routes ──[validators]──→ 400 Bad Request se body invalido
     │
     ▼
Controllers ──[chiamano services]──→ 409/404/etc se errore di business
     │
     ▼
  Services ──[usano Prisma]──→ Database PostgreSQL
     │
     ▼
     Risposta JSON
```

Ogni strato ha una responsabilità ben distinta e non si mescola con gli altri.

---

## Avvio completo (start.js)

Nella **root del progetto** è presente `start.js` che avvia l'intera applicazione con un unico comando:

```bash
node start.js
```

Cosa fa:
1. Avvia PostgreSQL se non in esecuzione (tenta `pg_ctl` / `brew services` / `systemctl`)
2. Applica migrazioni Prisma (`prisma migrate deploy`)
3. Genera il client Prisma (`prisma generate`)
4. Avvia il backend (`pg_backend/`) su porta 5000
5. Avvia il frontend (`pg_frontend/`) su porta 8100
6. Apre automaticamente il browser su `http://localhost:8100` e Prisma Studio su `http://localhost:5557`

Dipende dal modulo `pg` installato nella root `package.json` (usato per test di connessione DB).

---

## Configurazione e Setup

Il progetto usa **Prisma 7** come ORM per PostgreSQL. La connessione al DB è configurata in due file:

| File | Ruolo |
|------|-------|
| `prisma.config.ts` | Definisce l'URL del datasource leggendo `DATABASE_URL` da `.env` (richiesto da Prisma 7) |
| `prisma/schema.prisma` | Modelli del database (Prisma schema) |
| `.env` | Contiene `DATABASE_URL`, `PORT`, `JWT_SECRET` e altre variabili d'ambiente |

### Prisma 7 vs versioni precedenti

In Prisma 7, l'URL del database **non si può** specificare nel datasource dello schema (`schema.prisma`). Va passato via `prisma.config.ts`:

```ts
// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL },
});
```

Inoltre, il `PrismaClient` deve essere costruito con un adapter esplicito:

```ts
// src/prisma/client.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
```

### Script di setup automatico

Sono disponibili due script di setup:

| Script | Piattaforma | Linguaggio |
|--------|-------------|------------|
| `setup-db.js` | **Windows, Linux, macOS** | Node.js (cross-platform) |
| `setup-db.sh` | Linux, macOS (Unix) | Bash |

Entrambi automatizzano creazione del database e migrazioni:

1. Verificano i prerequisiti (Node.js, npm, `npx`)
2. Leggono `DATABASE_URL` dal file `.env`
3. Verificano che PostgreSQL sia raggiungibile
4. Creano il database `prenotazioni_db` se non esiste
5. Eseguono `npx prisma migrate deploy` (applica migrazioni pendenti)
6. Generano il Prisma Client con `npx prisma generate`

Esecuzione:
```bash
node setup-db.js      # cross-platform (raccomandato)
# oppure
./setup-db.sh         # solo Unix
```

#### `setup-db.js` — diagnostica avanzata

Lo script Node.js include funzionalità aggiuntive rispetto alla versione bash:

- **Rilevamento del servizio PostgreSQL** specifico per piattaforma:
  - **Windows**: usa `sc query` per trovare servizi "postgres" e verificare se sono in esecuzione
  - **macOS**: verifica con `brew services list`
  - **Linux**: usa `pg_isready` e `systemctl`
- **Connessione via modulo `pg`** (già nelle dipendenze npm) — non richiede client PostgreSQL da riga di comando
- **Fallback su più database di manutenzione**: tenta `postgres` → `template1` → direttamente il DB target
- **Codici di errore PostgreSQL decodificati**:
  - `28P01` → autenticazione fallita (password errata o `pg_hba.conf`)
  - `ECONNREFUSED` → PostgreSQL non in ascolto
  - `ENOTFOUND` → host irraggiungibile (suggerisce `127.0.0.1` invece di `localhost` su Windows)
- **Hint specifici per Windows**: percorso `pg_hba.conf`, comando `netstat`, link download

### Seed dati di test

`prisma/seed.ts` pulisce automaticamente i dati esistenti (in ordine di FK) e popola il database con dati di esempio:

| Tabella | Righe | Dettaglio |
|---------|-------|-----------|
| Studente | 5 | Mario Rossi, Lisa Bianchi, Luca Ferrari, Sofia Romano, Marco Esposito |
| CorsoDiStudi | 3 | Informatica, Ingegneria, Matematica |
| Docente | 4 | Giuseppe Verdi, Anna Neri, Maria Bianco, Paolo Russo |
| Amministratore | 2 | Admin, Super Admin |
| Corso | 5 | Programmazione Web, Basi di Dati, Ingegneria del Software, Reti di Calcolatori, Intelligenza Artificiale |
| DocenteCorsoDiStudi | 4 | Relazioni docente ↔ corso di studi |
| Bacheca | 3 | Una per ogni corso di studi |
| FAQ | 6 | Domande/Risposte distribuite tra le bacheche |
| SlotRicevimento | 6 | Distribuiti tra i vari docenti in date diverse |
| LuogoRicevimento | 3 | Aula 5, Studio 12, Lab 3 |
| Prenotazione | 5 | Stati: CONFERMATA, IN_ATTESA, RIFIUTATA |
| Documento | 3 | PDF, ZIP, DOCX associati alle prenotazioni |
| Notifica | 5 | Vari tipi: CONFERMA, AVVISO, RIFIUTO, CANCELLAZIONE |

Esecuzione: `npm run seed`

> **⚠️ Password di tutti gli utenti di test: `password123`**

### Prisma Client

Il client Prisma è generato in `node_modules/@prisma/client` e importato tramite `src/prisma/client.ts`. Se lo schema cambia, rigenerarlo con:

```bash
npx prisma generate
```

---

## services/

**Logica di business.** Ogni file interagisce con Prisma, non sa nulla di HTTP o Express. Legge/scrive sul DB, esegue validazioni di business (es. "email già in uso"), hasha password, lancia errori.

| File | Descrizione |
|------|-------------|
| `auth.service.ts` | Registrazione (studente/docente/admin), login, profilo, refresh token, cambio/reset password, JWT. Supporta CorsoDiStudi (ricerca per id/nome) |
| `studenti.service.ts` | Profilo studente (GET, PUT). Restituisce `corsoDiStudi` oggetto annidato |
| `docenti.service.ts` | Elenco/dettagli docenti, CRUD slot ricevimento, statistiche. Filtro per nome CorsoDiStudi. `getDettagliDocente` response include `corsi[]` e `corsiDiStudi[]` |
| `prenotazioni.service.ts` | CRUD prenotazioni, gestione stato (IN_ATTESA → CONFERMATA/COMPLETATA/ANNULLATA/RIFIUTATA). Helper `fmtLuogo()` e `mapLuogoRicevimento()` per response. `getPrenotazioneById` include `studente` (nome completo) e `studenteEmail`. `.toLowerCase()` su tutti gli stati in output per coerenza frontend |
| `segnalazioni.service.ts` | CRUD segnalazioni, cambio stato, filtri admin |
| `admin.service.ts` | Statistiche dashboard, gestione utenti (CRUD con supporto CorsoDiStudi), slot globali (CRUD + filtri + date disponibili), blocca giorni |
| `corsi.service.ts` | ✅ CRUD corsi, associazione corso ↔ docente |
| `bacheca.service.ts` | ✅ CRUD bacheca (una per CorsoDiStudi), CRUD FAQ |
| `documenti.service.ts` | *(da implementare)* Upload/download documenti |
| `notifiche.service.ts` | ✅ CRUD notifiche multi-ruolo (studente, docente, admin) |
| `email.service.ts` | ✅ Invio email con nodemailer (logga in console se SMTP non configurato) |
| `codice-verifica.service.ts` | ✅ Generazione, verifica e consumo codici 6 cifre (riusabile per 2FA) |
| `cleanup.service.ts` | *(da implementare)* Pulizia automatica dati vecchi (prenotazioni, slot, codici verifica, notifiche) con node-cron |
| `aulae.service.ts` | *(da implementare)* CRUD aule disponibili per ricevimento |

---

## controllers/

**Gestori delle richieste HTTP.** Ogni funzione riceve `Request` e `Response` di Express, chiama il service corrispondente e restituisce lo status code appropriato con JSON. Nessuna logica di business.

Pattern:
```ts
export async function createCorso(req: Request, res: Response) {
  try {
    const corso = await corsoService.create(req.body);
    return res.status(201).json(corso);
  } catch (err) {
    if (err instanceof Error && err.message === '...') {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## routes/

**Definiscono gli endpoint HTTP.** Usano `Router` di Express, applicano i validators come middleware e collegano al controller corrispondente.

Esempio:
```ts
router.post('/', authenticate, validators, controller.create);
router.get('/', authenticate, controller.findAll);
router.get('/:id', authenticate, controller.findById);
router.put('/:id', authenticate, validators, controller.update);
router.delete('/:id', authenticate, controller.delete);
```

Le routes vengono montate in `app.ts` su prefisso `/api`. Esempio per auth (`auth.routes.ts`):

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/login` | POST | Login unificato (Studente/Docente/Admin) |
| `/api/registrazione` | POST | Registrazione studente |
| `/api/recupera-password` | POST | Richiedi reset password (invia codice 6 cifre via email) |
| `/api/auth/verifica-codice` | POST | Verifica codice senza consumarlo (riusabile per 2FA) |
| `/api/reset-password` | POST | Conferma reset con email + codice + nuova password |
| `/api/auth/register/studente` | POST | Registrazione studente (alternativo) |
| `/api/auth/register/docente` | POST | Registrazione docente |
| `/api/auth/register/admin` | POST | Registrazione amministratore |
| `/api/auth/refresh` | POST | Rinnovo access token |
| `/api/auth/change-password` | POST | Cambio password (autenticato) |
| `/api/auth/profile` | GET | Dati profilo (autenticato) |

Endpoint studenti (`studenti.routes.ts`):

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/studenti/:matricola` | GET | JWT | Profilo studente |
| `/api/studenti/:matricola` | PUT | JWT | Aggiorna profilo studente |

Endpoint docenti (`docenti.routes.ts`):

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/docenti` | GET | - | Elenco docenti (pubblico) |
| `/api/docenti/:id` | GET | - | Dettagli docente (pubblico) |
| `/api/docenti/:idDocente/slots` | GET | JWT | Slot del docente (filtro `?mese=YYYY-MM`) |
| `/api/docenti/:idDocente/slots` | POST | JWT | Crea slot |
| `/api/docenti/:idDocente/slots/:idSlot` | PUT | JWT | Modifica slot |
| `/api/docenti/:idDocente/slots/:idSlot` | DELETE | JWT | Elimina slot |
| `/api/docenti/:idDocente/statistiche` | GET | JWT | Statistiche argomenti |

Endpoint prenotazioni (`prenotazioni.routes.ts`):

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/prenotazioni` | POST | JWT | Crea prenotazione (multipart per documenti) |
| `/api/prenotazioni/:id` | DELETE | JWT | Annulla prenotazione (logica) |
| `/api/prenotazioni/:id/fisico` | DELETE | JWT | Elimina prenotazione (fisica) |
| `/api/prenotazioni/:id` | GET | JWT | Dettaglio prenotazione per ID |
| `/api/prenotazioni/studente/:matricolaStudente` | GET | JWT | Prenotazioni dello studente |
| `/api/prenotazioni/docente/:idDocente` | GET | JWT | Prenotazioni del docente |
| `/api/prenotazioni/:id/stato` | PUT | JWT | Aggiorna stato (IN_ATTESA/CONFERMATA/COMPLETATA/ANNULLATA/RIFIUTATA) |

### ✅ Fase 3 completata — Corsi

Endpoint corsi (`corsi.routes.ts`):

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/corsi` | GET | - | Elenco corsi (filtro `?docenteId=`) |
| `/api/corsi/:id` | GET | - | Dettagli corso con docente |
| `/api/corsi` | POST | JWT (DOCENTE, AMMINISTRATORE) | Crea corso |
| `/api/corsi/:id` | PUT | JWT (DOCENTE, AMMINISTRATORE) | Modifica corso |
| `/api/corsi/:id` | DELETE | JWT (DOCENTE, AMMINISTRATORE) | Elimina corso |

### ✅ Fase 4 completata — Bacheca e FAQ

Endpoint bacheca (`bacheche.routes.ts`):

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/bacheche/corso-di-studi/:idCorsoDiStudi` | GET | - | Bacheca di un corso di studi (con FAQ) |
| `/api/bacheche/corso-di-studi/:idCorsoDiStudi` | PUT | JWT (DOCENTE, AMMINISTRATORE) | Aggiorna bacheca |
| `/api/bacheche/corso-di-studi/:idCorsoDiStudi/faq` | GET | - | FAQ della bacheca |
| `/api/bacheche/corso-di-studi/:idCorsoDiStudi/faq` | POST | JWT (DOCENTE, AMMINISTRATORE) | Crea FAQ |
| `/api/faq/:id` | PUT | JWT (DOCENTE, AMMINISTRATORE) | Modifica FAQ |
| `/api/faq/:id` | DELETE | JWT (DOCENTE, AMMINISTRATORE) | Elimina FAQ |

### ✅ Fase 7 completata — Notifiche

Endpoint notifiche (`notifiche.routes.ts`):

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/notifiche/:destinatarioId` | GET | JWT | Elenco notifiche per destinatario (filtro `?ruolo=`) |
| `/api/notifiche` | POST | JWT | Crea notifica |
| `/api/notifiche/:id/letta` | PATCH | JWT | Segna come letta |
| `/api/notifiche/:destinatarioId/letta-tutte` | POST | JWT | Segna tutte come lette |
| `/api/notifiche/:destinatarioId/lette` | DELETE | JWT | Cancella notifiche lette |

Endpoint admin (`admin.routes.ts`):

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/admin/stats` | GET | Statistiche dashboard. `prenotazioniOggi` conta prenotazioni il cui slot cade oggi (non per data creazione). `slotAttivi` conta tutti gli slot (non solo quelli liberi). |
| `/api/admin/utenti` | GET | Lista utenti unificata (filtro `?ruolo=`) |
| `/api/admin/utenti` | POST | Creazione utente |
| `/api/admin/utenti/:id` | PUT | Modifica utente |
| `/api/admin/utenti/:id` | DELETE | Eliminazione utente |
| `/api/admin/slot-date` | GET | Date disponibili degli slot (raggruppate per data con conteggio) |
| `/api/admin/slot` | GET | Lista slot globali (filtri `?docenteId=&data=&stato=`) |
| `/api/admin/slot` | POST | Crea slot (body: `{ docenteId, data, oraInizio, oraFine, disponibilita?, luogo? }`) |
| `/api/admin/slot/:idSlot` | PUT | Modifica slot (stessi campi del create, tutti opzionali) |
| `/api/admin/slot/:idSlot` | DELETE | Elimina slot (cancella in cascata luogo e prenotazioni associate) |
| `/api/admin/giorni-bloccati` | GET | Lista giorni bloccati |
| `/api/admin/giorni-bloccati` | POST | Blocca un giorno (body: `{ data, motivo? }`) |
| `/api/admin/giorni-bloccati/:id` | DELETE | Sblocca un giorno |

Endpoint segnalazioni (`segnalazioni.routes.ts`):

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/segnalazioni` | POST | JWT | Crea segnalazione (body: `{ oggetto, descrizione, matricola_studente }`) |
| `/api/segnalazioni/studente/:matricola` | GET | JWT | Segnalazioni di uno studente |
| `/api/segnalazioni/admin/all` | GET | Admin | Tutte le segnalazioni con dati studente (filtro `?stato=`) |
| `/api/segnalazioni/:id/stato` | PATCH | Admin | Aggiorna stato (`APERTA` / `IN_LAVORAZIONE` / `CHIUSA`) |
| `/api/segnalazioni/:id` | DELETE | Admin | Elimina segnalazione |

Endpoint aule (`aulae.routes.ts`):

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/aulae` | GET | JWT | Elenco aule disponibili |
| `/api/aulae` | POST | Admin | Crea aula |
| `/api/aulae/:id` | PUT | Admin | Modifica aula |
| `/api/aulae/:id` | DELETE | Admin | Elimina aula |

---

## validators/

**Schemi di validazione** con `express-validator`. Validano body/params/query prima che arrivino al controller. Se falliscono, rispondono con `400 Bad Request`.

I campi nei body delle richieste usano **camelCase** (coerenti con il frontend Angular). Il service si occupa di mappare a snake_case per Prisma.

Esempio:
```ts
export const studenteRegistrationSchema = [
  body('matricola').isString().notEmpty().trim(),
  body('nome').isString().notEmpty().trim(),
  body('cognome').isString().notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('corsoDiStudi').isString().notEmpty().trim(),
];

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
```

File validator aggiuntivo:

| File | Descrizione |
|------|-------------|
| `auth.validators.ts` | Login, registrazione (studente/docente/admin), cambio/reset password, refresh token. `corsoDiStudiId` opzionale per registrazione studente |
| `admin.validators.ts` | Creazione/modifica utenti admin, filtri slot globali. `corsoDiStudiId` per creazione studente |
| `studenti.validators.ts` | Aggiornamento profilo studente |
| `docenti.validators.ts` | Creazione/modifica slot, filtri mese |
| `prenotazioni.validators.ts` | Creazione prenotazione, aggiornamento stato |
| `segnalazioni.validators.ts` | Creazione segnalazione, aggiornamento stato |
| `corsi.validators.ts` | ✅ Creazione/modifica corsi |
| `bacheca.validators.ts` | ✅ Aggiornamento bacheca, creazione/modifica FAQ |
| `notifiche.validators.ts` | ✅ Creazione notifiche multi-ruolo |
| `documenti.validators.ts` | *(da implementare)* Upload documenti |
| `aulae.validators.ts` | *(da implementare)* Creazione/modifica aule |

---

## Flusso di una richiesta (esempio: login)

```
  POST /api/login  (body JSON con email, password)
       │
       ▼
  [validators: loginSchema] → controlla email e password
       │
  ┌────┴──────────┐
  │ se invalido    │ → 400 { errors: [...] }
  └────────────────┘
       │ valido
       ▼
  [controller: login]
       │
       ▼
  [service: authService.login(email, password)]
       │
       ▼
  Cerca Studente → Docente → Amministratore per email
       │
  ┌────┴──────────────┐
  │ non trovato        │ → 401 Invalid email or password
  └───────────────────┘
       │ trovato
       ▼
  bcrypt.compare(password, user.password)
       │
  ┌────┴──────────────┐
  │ non matcha         │ → 401 Invalid email or password
  └───────────────────┘
       │ match
       ▼
  jwt.sign({ id, email, ruolo }, JWT_SECRET)
       │
       ▼
  200 { id, nome, cognome, email, role, token }
```

## Flusso di una richiesta (esempio: cambio password, autenticato)

```
  POST /api/auth/change-password (Authorization: Bearer <token>)
       │
       ▼
  [middleware authenticate]
       │
  ┌────┴──────────────┐
  │ token assente/     │
  │ invalido/scaduto   │ → 401 Token required / Invalid or expired token
  └───────────────────┘
       │ valido → req.user = { id, email, ruolo }
       ▼
  [validators: changePasswordSchema]
       │
  ┌────┴──────────┐
  │ se invalido    │ → 400 { errors: [...] }
  └────────────────┘
       │ valido
       ▼
  [controller: changePassword]
       │
       ▼
  [service: authService.changePassword(id, ruolo, old, new)]
       │
  ┌────┴──────────────┐
  │ oldPassword errata │ → 401 Wrong password
  └───────────────────┘
       │ ok
       ▼
  200 { messaggio: "Password cambiata con successo." }
```

---

## Allineamento con frontend Angular

Il backend è allineato con il `AuthService` Angular esistente:

| Angular chiama | Backend risponde |
|---|---|---|
| `POST /api/login` | `{ id, nome, cognome, email, role, token }` |
| `POST /api/registrazione` | `{ id, nome, cognome, email, role, token }` (JWT, auto-login) |
| `POST /api/recupera-password` | `{ messaggio: "..." }` (invia codice 6 cifre via email) |
| `POST /api/auth/verifica-codice` | `{ valido: true }` o 401 (non consuma il codice) |
| `POST /api/reset-password` | `{ messaggio: "Password reimpostata con successo." }` (consuma il codice) |

**Convenzioni:**
- **Porta**: backend su `5000` (Angular chiama `ip:5000`)
- **camelCase**: i body usano camelCase (`corsoDiStudi`, `nuovaPassword`) — il service mappa a snake_case per Prisma
- **Amministratore**: non ha `cognome` nello schema; login e profilo restituiscono `cognome: ''`
- **Role case**: il backend usa ruoli in **MAIUSCOLO** (`STUDENTE`, `DOCENTE`, `AMMINISTRATORE`); il frontend li normalizza in **lowercase** (`studente`, `docente`, `amministratore`) all'arrivo della risposta in `AuthService.login()` e `loadSessionFromStorage()`
- **CorsoDiStudi**: entità autonoma (non enum) per permettere gestione admin. `Docente` può insegnare in più CorsoDiStudi (tabella join `DocenteCorsoDiStudi`). `Studente` ha FK `id_corso_di_studi`. `Bacheca` appartiene a `CorsoDiStudi` anziché a `Corso`.
- **materia docente**: non è più un campo diretto su `Docente`. Si deriva da `docente.corsi[0]?.nome_corso` nel response.
- **luogo**: nei response delle prenotazioni, `luogo` è una stringa formattata "Aula 5, Edificio D (Primo piano)". L'oggetto completo è disponibile in `luogoRicevimento`.
- **TipoDiDocenza**: il docente può essere `ORDINARIO` (ufficio fisso, luogo bloccato all'ufficio) o `CONTRATTO` (sceglie un'aula dalla lista `Aula` nel DB). Campo gestito solo dall'admin.

---

## TODO — 11 fasi di implementazione

| Fase | Cosa implementare | Stato |
|------|-------------------|-------|
| 1 | Setup DB, script `setup-db.sh`/`setup-db.js`, migrazioni, seed dati | ✅ |
| 2 | Auth: login JWT, middleware, profile, refresh, cambio/reset password, register admin | ✅ |
| 3 | CRUD Corsi, associazione corso ↔ docente | ✅ |
| 4 | CRUD Bacheca e FAQ | ✅ |
| 5 | CRUD SlotRicevimento e LuogoRicevimento | ✅ |
| 6 | CRUD Prenotazione, gestione stato | ✅ |
| 7 | CRUD Notifiche (multi-ruolo: studente, docente, admin) | ✅ |
| 8 | Amministratore: dashboard, statistiche, gestione utenti, slot globali (CRUD completo + filtri) | ✅ |
| 9 | CRUD Documenti (upload/download per prenotazioni) | ✅ |
| 10 | CRUD Segnalazioni: backend (routes, controller, service, validators) + frontend admin (pagina gestione) | ✅ |
| 11 | Blocca giorni: modello GiornoBloccato, API backend, pagina admin gestione-calendario | ✅ |

### Dettaglio API ancora da implementare

#### ~~Fase 9 — Documenti~~ ✅ Completata

Endpoint documenti (`documenti.routes.ts`, `documenti.controller.ts`, `documenti.service.ts`):
- `POST /api/documenti/upload` — carica file (multipart, autenticato)
- `GET /api/documenti/:id` — scarica file (autenticato)
- `GET /api/prenotazioni/:id/documenti` — documenti di una prenotazione (autenticato)
- `DELETE /api/documenti/:id` — elimina documento (autenticato)

### Task aggiuntivi

- [x] Amministratore: CRUD slot (creare, modificare, eliminare slot dalla dashboard)
- [x] Amministratore: gestione segnalazioni (tabella, filtri, cambio stato)
- [x] Amministratore: gestire prenotazioni (cambio stato, elimina, dettagli)
- [x] Amministratore: bloccare giorni dal calendario (es. festivi)
- [ ] Eliminare la possibilità di cambiare ruoli agli utenti (inutile)

### Bug fix applicati

- **[14/05/2026] piano edificio non numerico**: `docenti.service.ts` — rimosso `parseInt()` su `s.luogo.piano` che causava `NaN` per valori non numerici come "Primo piano" o "Piano terra". Il campo è ora gestito come stringa, allineato con l'interfaccia frontend (commit `07057b4`).
- **[22/05/2026] DB: aggiunto `id_corso_di_studi` a `Corso`**: nuova FK opzionale verso `CorsoDiStudi`. Migrazione `add_corso_corso_di_studi`. Seed aggiornato con associazioni corso → CorsoDiStudi e nuovo docente Elena Colombo per Matematica.
- **[22/05/2026] Backend: `docenti.service.ts` — response unificati**: `getElencoDocenti` ora restituisce anche `corsi[]` (id+nome). `getDettagliDocente` ora include `materia` e `corsoDiStudi: string[]` per consistenza.
- **[22/05/2026] Frontend `bacheche-docente`: selezione CorsoDiStudi**: aggiunto selettore `<ion-select>` per docenti con più CorsiDiStudi, invece di usare sempre `corsi[0]`.

---

## Flusso di una richiesta (recupero password con codice di verifica)

```
  POST /api/recupera-password  (body: { email })
       │
       ▼
  [service: forgotPassword(email)]
       │
       ├── Cerca Studente → Docente → Amministratore per email
       ├── Se non trovato → { messaggio } (stessa risposta, sicurezza)
       ├── Se trovato → creaCodice(email, 'reset_password')
       │     ├── Codice 6 cifre casuali (crypto.randomInt)
       │     ├── Hash bcrypt del codice salvato su DB (tabella CodiceVerifica)
       │     └── Scadenza: 15 minuti
       └── sendCodiceVerifica(email, codice, 'reset_password')
             ├── Se SMTP configurato → invia email HTML con codice
             └── Se SMTP non configurato → logga il codice in console
       │
       ▼
  200 { messaggio: "Se l'email esiste, riceverai un codice..." }

  ─── (l'utente inserisce il codice nel form) ───

  POST /api/auth/verifica-codice  (body: { email, codice })
       │
       ▼
  [service: verificaCodice(email, codice, 'reset_password')]
       │
       ├── Cerca CodiceVerifica per email + tipo + non scaduto + non usato
       ├── bcrypt.compare(codice, record.codice)
       │   ├── Non matcha → 401 Codice non valido o scaduto
       │   └── Matcha → { valido: true }
       │
       ※ NON consuma il codice (riusabile per futura autenticazione 2FA)
       │
       ▼
  200 { valido: true }

  ─── (l'utente inserisce nuova password + conferma) ───

  POST /api/reset-password  (body: { email, codice, nuovaPassword })
       │
       ▼
  [service: resetPassword(email, codice, nuovaPassword)]
       │
       ├── consumaCodice(email, codice, 'reset_password')
       │   ├── Matcha → marca record come usato = true
       │   └── Non matcha → 401 Codice non valido o scaduto
       ├── Trova utente per email (Studente/Docente/Admin)
       ├── bcrypt.hash(nuovaPassword)
       └── Update password sulla tabella corrispondente
       │
       ▼
  200 { messaggio: "Password reimpostata con successo." }
```

### Vantaggi del sistema a codice rispetto al JWT link

| Aspetto | JWT link (precedente) | Codice 6 cifre (attuale) |
|---------|----------------------|-------------------------|
| Consegna | Link via email (può essere bloccato) | Codice via email, visibile subito |
| UX mobile | Scomodo (aprire link su telefono) | Comodo (copia/incolla codice) |
| Riutilizzabilità | Solo reset password | Stesso sistema per futura 2FA |
| Scadenza | JWT 15 min (non revocabile) | DB 15 min (revocabile, invalidabile) |
| Sicurezza | Crittografato (JWT firmato) | Hash bcrypt + scadenza DB |

---

> **Nota:** La pianificazione dettagliata della Fase 11 (Blocca giorni) è stata rimossa in quanto già implementata. Vedi sezione API admin per gli endpoint `/api/admin/giorni-bloccati`.

---

## Bug Hunt — Piano di fix (22/05/2026)

### Fase 1 — Endpoint mancanti (critico)

| # | Task | File | Stima |
|---|------|------|-------|
| 1.1 | Aggiungere `POST /api/studenti/:matricola/cambia-password` (collegare ad `authService.changePassword`) | `studenti.routes.ts`, `studenti.controller.ts` | piccola |
| 1.2 | Aggiungere `DELETE /api/studenti/:matricola` (elimina account studente) | `studenti.routes.ts`, `studenti.controller.ts`, `studenti.service.ts` | piccola |
| 1.3 | Aggiungere `POST /api/segnalazioni/docente` e `GET /api/segnalazioni/docente/:id` | `segnalazioni.routes.ts`, controller, service | media |
| 1.4 | Allineare field name: frontend manda `corsoDiStudi`, backend aspetta `corsoDiStudiId` | `studenti.validators.ts` o frontend | piccola |

### Fase 2 — Race condition e consistenza dati (critico)

| # | Task | File | Stima |
|---|------|------|-------|
| 2.1 | Avvolgere creazione prenotazione + update slot in `prisma.$transaction()` | `prenotazioni.service.ts:69-87` | piccola |
| 2.2 | Aggiungere cancellazione documenti prima di eliminare slot (admin e docente) | `admin.service.ts:384-386`, `docenti.service.ts:255-261` | piccola |
| 2.3 | Limitare `upload.any()` → `upload.array('files', 5)` e spostare upload dopo la validazione | `prenotazioni.routes.ts:21` | piccola |

### Fase 3 — Autorizzazione mancante (alto)

| # | Task | File | Stima |
|---|------|------|-------|
| 3.1 | Aggiungere `authorize('AMMINISTRATORE')` a `GET /admin/giorni-bloccati` | `admin.routes.ts:47` | piccola |
| 3.2 | Verificare che `req.user.id === req.params.idDocente` negli slot docente | `docenti.controller.ts` + `docenti.routes.ts` | media |
| 3.3 | Aggiungere autorizzazione alle statistiche docente (solo docente stesso o admin) | `docenti.routes.ts:27` | piccola |

### Fase 4 — Timezone e validazione (medio)

| # | Task | File | Stima |
|---|------|------|-------|
| 4.1 | Sostituire `toISOString()` con formattazione locale per campi `@db.Time(6)` | `docenti.service.ts:128`, `admin.service.ts:315`, `prenotazioni.service.ts:96` | media |
| 4.2 | Centralizzare `handleValidationErrors` in `middleware/validation.ts` | Tutti i validators/ | piccola |
| 4.3 | Validare `JWT_SECRET` all'avvio del server | `server.ts` | piccola |
| 4.4 | Aggiungere graceful shutdown (`SIGTERM`/`SIGINT` → `prisma.$disconnect()`) | `server.ts` | piccola |
| 4.5 | Validare formato data (`YYYY-MM-DD`) e ora (`HH:mm`) nei validators | `docenti.validators.ts`, `admin.validators.ts` | piccola |
| 4.6 | Allineare case degli stati (lowercase output vs uppercase validatori) | `prenotazioni.service.ts` + `prenotazioni.validators.ts` | piccola |

### Fase 5 — Pulizia codice (basso)

| # | Task | File | Stima |
|---|------|------|-------|
| 5.1 | Rimuovere endpoint duplicato `POST /api/auth/register/studente` (esiste già `/api/registrazione`) | `auth.routes.ts:36` | piccola |
| 5.2 | Rimuovere `handleValidationErrors` duplicato dai validators di auth (già nella route) | `auth.validators.ts:49-60` | piccola |

---

## Prossime implementazioni

### 1. Pulizia automatica DB (cleanup.service.ts)

Job schedulato con `node-cron` in `server.ts` alle 3:00 ogni notte.

| Entità | Criterio di cancellazione |
|--------|--------------------------|
| `Prenotazione` + `Documento` associati | `slot.data` passata da > 6 mesi, stati CONFERMATA / COMPLETATA / RIFIUTATA / ANNULLATA |
| `SlotRicevimento` + `LuogoRicevimento` | Data passata da > 6 mesi e nessuna prenotazione associata |
| `CodiceVerifica` | `usato = true` o `scadenza < now()` da > 30gg |
| `Notifica` | `letta = true` e `data_invio < now() - 1 anno` |

Hard delete (nessuna archiviazione).

### 2. TipoDiDocenza su Docente

Aggiungere campo `tipo_di_docenza` al modello `Docente` nello schema Prisma:

```prisma
model Docente {
  ...
  tipo_di_docenza String @default("ORDINARIO")  // "ORDINARIO" | "CONTRATTO"
  ...
}
```

Comportamento:
- **Ordinario**: ha un ufficio fisso (`Docente.ufficio`). Il luogo dello slot è bloccato all'ufficio.
- **Contratto**: non ha ufficio. Sceglie un'aula dalla tabella `Aula` tramite dropdown.

Il campo è gestibile solo dall'admin (registrazione/modifica docente).

### 3. Nuova tabella Aula

Modello standalone (non legato a SlotRicevimento):

```prisma
model Aula {
  id_aula     String  @id @default(uuid())
  nome_aula   String
  edificio    String
  piano       String
  latitudine  Float?
  longitudine Float?
}
```

API completa CRUD (`aulae.routes.ts`, `aulae.controller.ts`, `aulae.service.ts`, `aulae.validators.ts`) accessibile solo ad admin per creazione/modifica/eliminazione, JWT per lettura.

### 4. Creazione slot — comportamento differenziato

**Frontend** (`gestione-slot.page.ts/html`):

- **Docente ORDINARIO**: campo `nomeAula` precompilato e readonly con `docente.ufficio`. Campi `edificio` e `piano` nascosti. Mappa facoltativa per coordinate.
- **Docente CONTRATTO**: `nomeAula` diventa `<ion-select>` popolato da `GET /api/aulae`. Alla selezione si auto-compilano `edificio` e `piano` (readonly). Mappa facoltativa.

**Backend** (`docenti.service.ts`, `docenti.validators.ts`):
- Se `tipo_di_docenza === "ORDINARIO"`, ignorare il luogo inviato e usare `docente.ufficio`.
- Se `tipo_di_docenza === "CONTRATTO"`, validare che l'aula scelta esista nella tabella `Aula`.

### 5. Registrazione studente — corso di studi

Già implementata: dropdown `<ion-select>` popolato da `GET /api/corsi-di-studio`. Il campo `corsoDiStudi` invia il nome (stringa). Opzionale migrare a `id_corso_di_studi` per robustezza.

### 6. Spostamento toggle tema

- **Rimuovere** il pulsante `<button class="toggle-tema">` da `topbar.component.html` e la logica associata (TS, SCSS).
- **Aggiungere** un `ion-toggle` "Tema scuro" nelle pagine `profilo-studente.page.html` e `profilo-docente.page.html`, solo per ruolo studente e docente (non admin).

### 7. Eliminazione TODO.md

Il file `pg_backend/TODO.md` non è più aggiornato (molte fasi completate risultano ancora non spuntate). Eliminato in favore di `DOCUMENTAZIONE.md`.

---

## Seed dati di test — aggiornamenti previsti

| Tabella | Righe | Dettaglio |
|---------|-------|-----------|
| Docente | 5 | 3 ORDINARIO (Verde, Neri, Bianco), 2 CONTRATTO (Russo, Colombo) |
| Aula | 4-5 | Aula 5, Studio 12, Lab 3, Aula Magna, Aula 7 |

---
