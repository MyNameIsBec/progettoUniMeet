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
│   │   ├── authorize.ts       # Middleware ruoli (controlla il ruolo dal JWT)
│   │   └── upload.ts          # Multer per upload file
│   ├── utils/
│   │   └── time.ts            # Helper formattazione orari
│   ├── app.ts                 # Configurazione Express
│   └── server.ts              # Entry point del server
├── prisma.config.ts           # Configurazione Prisma (datasource URL)
├── setup-db.sh                # Script automatizzato setup DB (Unix)
├── setup-db.js                # Script automatizzato setup DB (cross-platform)
├── dist/                      # JS compilato (generato da tsc, ignorato)
├── uploads/                   # File caricati (placeholder)
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
node start.js              # modalità produzione (default)
node start.js --dev        # modalità sviluppo (hot-reload)
node start.js --prod       # modalità produzione
node start.js --reset      # reset DB + seed
node start.js --no-seed    # setup DB senza seed
node start.js --no-start   # solo setup, senza avviare i servizi
```

**Modalità:**
- `--dev`: `NODE_ENV=development`, backend con `tsx watch` (hot-reload)
- `--prod` / default: `NODE_ENV=production`, backend compilato (`npm run build` + `node dist/server.js`)

Cosa fa:
1. Installa automaticamente le dipendenze (backend + frontend)
2. Avvia PostgreSQL se non in esecuzione (tenta `pg_ctl` / `brew services` / `systemctl`)
3. Applica migrazioni Prisma (`prisma migrate deploy`)
4. Genera il client Prisma (`prisma generate`)
5. Popola con dati di test se il DB è vuoto
6. Avvia il backend (`pg_backend/`) su porta 5000
7. Avvia il frontend (`pg_frontend/`) su porta 4200
8. Apre automaticamente il browser su `http://localhost:4200` e Prisma Studio su `http://localhost:5557`
9. Arresta tutto con `Ctrl+C`

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
| Docente | 5 | Giuseppe Verdi, Anna Neri, Maria Bianco, Paolo Russo, Elena Colombo |
| Amministratore | 2 | Admin, Super Admin |
| Corso | 7 | Programmazione Web, Basi di Dati, Ingegneria del Software, Reti di Calcolatori, Intelligenza Artificiale, Sistemi Operativi, Analisi Matematica |
| DocenteCorsoDiStudi | 4 | Relazioni docente ↔ corso di studi |
| Bacheca | 3 | Una per ogni corso di studi |
| FAQ | 12 | Domande/Risposte distribuite tra le bacheche, assegnate a docenti specifici |
| SlotRicevimento | 6 | Distribuiti tra i vari docenti in date diverse |
| LuogoRicevimento | 3 | Aula 5, Studio 12, Lab 3 |
| Prenotazione | 5 | Stati: CONFERMATA, IN_ATTESA, RIFIUTATA |
| Documento | 3 | PDF, ZIP, DOCX associati alle prenotazioni |
| Notifica | 5 | Vari tipi: CONFERMA, AVVISO, RIFIUTO, CANCELLAZIONE |

Esecuzione: `npm run seed`

> **⚠️ Password di tutti gli utenti di test: `Password123`**

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
| `auth.service.ts` | Registrazione (studente/docente/admin), login, reset password, refresh token, cambio password, JWT. Supporta CorsoDiStudi (ricerca per id/nome) |
| `studenti.service.ts` | Profilo studente (GET, PUT, DELETE), cambio password. Restituisce `corsoDiStudi` oggetto annidato |
| `docenti.service.ts` | Elenco/dettagli docenti, CRUD slot ricevimento, aggiornamento profilo, statistiche. Filtro per nome CorsoDiStudi. `getDettagliDocente` response include `corsi[]` e `corsiDiStudi[]` |
| `prenotazioni.service.ts` | CRUD prenotazioni, gestione stato (IN_ATTESA → CONFERMATA/COMPLETATA/ANNULLATA/RIFIUTATA), upload documenti. Helper `fmtLuogo()` e `mapLuogoRicevimento()` per response. `getPrenotazioneById` include `studente` (nome completo). `.toUpperCase()` su tutti gli stati in output |
| `corsi.service.ts` | CRUD corsi, associazione corso ↔ docente |
| `corsi-di-studio.service.ts` | Elenco corsi di studio |
| `bacheca.service.ts` | CRUD bacheca (una per Corso), CRUD FAQ. Supporto rotte per corso, corso-di-studi e docente autenticato |
| `segnalazioni.service.ts` | CRUD segnalazioni (studente e docente), cambio stato, filtri admin, upload allegato |
| `admin.service.ts` | Statistiche dashboard, gestione utenti (CRUD con supporto CorsoDiStudi), slot globali (CRUD + filtri + date disponibili), gestione prenotazioni, blocca giorni (con eliminazione slot/prenotazioni + notifica docenti) |
| `notifiche.service.ts` | CRUD notifiche multi-ruolo (studente, docente, admin), segna come lette |
| `email.service.ts` | Invio email con nodemailer (logga in console se SMTP non configurato) |
| `codice-verifica.service.ts` | Generazione, verifica e consumo codici 6 cifre per reset password |
| `reminder.service.ts` | Promemoria automatici via cron job (notifica email X ore prima del ricevimento) |

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

Le routes vengono montate in `app.ts` su prefisso `/api`:

| Route file | Prefisso |
|------------|----------|
| `auth.routes.ts` | `/api` |
| `admin.routes.ts` | `/api` |
| `studenti.routes.ts` | `/api` |
| `docenti.routes.ts` | `/api` |
| `prenotazioni.routes.ts` | `/api` |
| `notifiche.routes.ts` | `/api` |
| `segnalazioni.routes.ts` | `/api` |
| `corsi.routes.ts` | `/api` |
| `bacheche.routes.ts` | `/api` |
| `corsi-di-studio.routes.ts` | `/api` |

### Auth (`auth.routes.ts`)

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/login` | POST | — | Login unificato (Studente/Docente/Admin) |
| `/api/registrazione` | POST | — | Registrazione studente |
| `/api/recupera-password` | POST | — | Richiedi reset password (invia codice 6 cifre via email) |
| `/api/auth/verifica-codice` | POST | — | Verifica codice senza consumarlo |
| `/api/reset-password` | POST | — | Conferma reset con email + codice + nuova password |
| `/api/auth/register/docente` | POST | — | Registrazione docente |
| `/api/auth/register/admin` | POST | — | Registrazione amministratore |
| `/api/auth/refresh` | POST | — | Rinnovo access token |
| `/api/auth/change-password` | POST | JWT | Cambio password (autenticato) |
| `/api/auth/profile` | GET | JWT | Dati profilo (autenticato) |

### Studenti (`studenti.routes.ts`)

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/studenti/:matricola` | GET | JWT | Profilo studente |
| `/api/studenti/:matricola` | PUT | JWT | Aggiorna profilo studente |
| `/api/studenti/:matricola/cambia-password` | POST | JWT | Cambio password studente |
| `/api/studenti/:matricola` | DELETE | JWT | Elimina account studente |

### Docenti (`docenti.routes.ts`)

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/docenti` | GET | — | Elenco docenti (pubblico) |
| `/api/docenti/:id` | GET | — | Dettagli docente (pubblico) |
| `/api/docenti/:idDocente/slots` | GET | JWT | Slot del docente (filtro `?mese=YYYY-MM`) |
| `/api/docenti/:idDocente/slots` | POST | JWT (docente stesso) | Crea slot |
| `/api/docenti/:idDocente/slots/:idSlot` | PUT | JWT (docente stesso) | Modifica slot |
| `/api/docenti/:idDocente/slots/:idSlot` | DELETE | JWT (docente stesso) | Elimina slot |
| `/api/docenti/:idDocente/profilo` | PUT | JWT (docente stesso) | Aggiorna profilo docente |
| `/api/docenti/:idDocente/statistiche` | GET | JWT (docente stesso) | Statistiche argomenti |

### Prenotazioni (`prenotazioni.routes.ts`)

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/prenotazioni` | POST | JWT | Crea prenotazione (multipart per documenti) |
| `/api/prenotazioni/:id` | DELETE | JWT | Annulla prenotazione (logica) |
| `/api/prenotazioni/:id/fisico` | DELETE | JWT | Elimina prenotazione (fisica) |
| `/api/prenotazioni/:id` | GET | JWT | Dettaglio prenotazione per ID |
| `/api/prenotazioni/studente/:matricolaStudente` | GET | JWT | Prenotazioni dello studente |
| `/api/prenotazioni/docente/:idDocente` | GET | JWT | Prenotazioni del docente |
| `/api/prenotazioni/:id/stato` | PUT | JWT | Aggiorna stato (IN_ATTESA/CONFERMATA/COMPLETATA/ANNULLATA/RIFIUTATA) |
| `/api/prenotazioni/:id/documenti` | POST | JWT | Upload documenti su prenotazione |

### Corsi (`corsi.routes.ts`)

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/corsi` | GET | — | Elenco corsi (filtro `?docenteId=`) |
| `/api/corsi/:id` | GET | — | Dettagli corso con docente |
| `/api/corsi` | POST | JWT (DOCENTE, AMMINISTRATORE) | Crea corso |
| `/api/corsi/:id` | PUT | JWT (DOCENTE, AMMINISTRATORE) | Modifica corso |
| `/api/corsi/:id` | DELETE | JWT (DOCENTE, AMMINISTRATORE) | Elimina corso |

### Bacheche e FAQ (`bacheche.routes.ts`)

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/bacheche/corso/:idCorso` | GET | — | Bacheca di un corso (con FAQ) |
| `/api/bacheche/corso/:idCorso` | PUT | JWT (DOCENTE, AMMINISTRATORE) | Aggiorna bacheca |
| `/api/bacheche/corso/:idCorso/faq` | GET | — | FAQ della bacheca |
| `/api/bacheche/corso/:idCorso/faq` | POST | JWT (DOCENTE, AMMINISTRATORE) | Crea FAQ |
| `/api/bacheche/docente/me` | GET | JWT (DOCENTE) | Bacheche del docente loggato |
| `/api/bacheche/corso-di-studi/:idCorsoDiStudi` | GET | — | Bacheche per corso di studi |
| `/api/faq/:id` | PUT | JWT (DOCENTE, AMMINISTRATORE) | Modifica FAQ |
| `/api/faq/:id` | DELETE | JWT (DOCENTE, AMMINISTRATORE) | Elimina FAQ |

### Notifiche (`notifiche.routes.ts`)

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/notifiche/:destinatarioId` | GET | JWT | Elenco notifiche per destinatario (filtro `?ruolo=`) |
| `/api/notifiche` | POST | JWT (AMMINISTRATORE) | Crea notifica |
| `/api/notifiche/:id/letta` | PATCH | JWT | Segna come letta |
| `/api/notifiche/:destinatarioId/letta-tutte` | POST | JWT | Segna tutte come lette |
| `/api/notifiche/:destinatarioId/lette` | DELETE | JWT | Cancella notifiche lette |

### Admin (`admin.routes.ts`)

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/admin/stats` | GET | Admin | Statistiche dashboard |
| `/api/admin/utenti` | GET | Admin | Lista utenti unificata (filtro `?ruolo=`) |
| `/api/admin/utenti` | POST | Admin | Creazione utente |
| `/api/admin/utenti/:id` | PUT | Admin | Modifica utente |
| `/api/admin/utenti/:id` | DELETE | Admin | Eliminazione utente |
| `/api/admin/slot-date` | GET | Admin | Date disponibili degli slot |
| `/api/admin/slot` | GET | Admin | Lista slot globali (filtri `?docenteId=&data=&stato=`) |
| `/api/admin/slot` | POST | Admin | Crea slot |
| `/api/admin/slot/:idSlot` | PUT | Admin | Modifica slot |
| `/api/admin/slot/:idSlot` | DELETE | Admin | Elimina slot (cancella in cascata luogo e prenotazioni) |
| `/api/admin/prenotazioni` | GET | Admin | Lista tutte le prenotazioni |
| `/api/admin/prenotazioni/:id/stato` | PUT | Admin | Aggiorna stato prenotazione |
| `/api/admin/prenotazioni/:id` | DELETE | Admin | Elimina prenotazione |
| `/api/admin/giorni-bloccati` | GET | — | Lista giorni bloccati |
| `/api/admin/giorni-bloccati` | POST | Admin | Blocca un giorno (body: `{ data, motivo? }`) |
| `/api/admin/giorni-bloccati/:id` | DELETE | Admin | Sblocca un giorno |

### Segnalazioni (`segnalazioni.routes.ts`)

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/segnalazioni` | POST | JWT | Crea segnalazione studente (multipart per allegato) |
| `/api/segnalazioni/studente/:matricola` | GET | JWT | Segnalazioni di uno studente |
| `/api/segnalazioni/admin/all` | GET | Admin | Tutte le segnalazioni con dati studente (filtro `?stato=`) |
| `/api/segnalazioni/:id/stato` | PATCH | Admin | Aggiorna stato (`APERTA` / `IN_LAVORAZIONE` / `CHIUSA`) |
| `/api/segnalazioni/:id` | DELETE | Admin | Elimina segnalazione |
| `/api/segnalazioni/docente` | POST | JWT | Crea segnalazione docente (multipart per allegato) |
| `/api/segnalazioni/docente/:idDocente` | GET | JWT | Segnalazioni di un docente |

### Corsi di Studio (`corsi-di-studio.routes.ts`)

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/corsi-di-studio` | GET | — | Elenco corsi di studio |

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
```

| File | Descrizione |
|------|-------------|
| `auth.validators.ts` | Login, registrazione (studente/docente/admin), cambio/reset password, refresh token |
| `admin.validators.ts` | Creazione/modifica utenti admin, slot globali, giorni bloccati |
| `studenti.validators.ts` | Aggiornamento profilo, cambio password studente |
| `docenti.validators.ts` | Creazione/modifica slot, filtri mese |
| `prenotazioni.validators.ts` | Creazione prenotazione, aggiornamento stato |
| `segnalazioni.validators.ts` | Creazione segnalazione (studente/docente), aggiornamento stato |
| `corsi.validators.ts` | Creazione/modifica corsi |
| `bacheca.validators.ts` | Aggiornamento bacheca, creazione/modifica FAQ |
| `notifiche.validators.ts` | Creazione notifiche |

---

## middleware/

| File | Descrizione |
|------|-------------|
| `authenticate.ts` | Verifica JWT da header `Authorization: Bearer <token>`. Aggiunge `req.user = { id, email, ruolo }` |
| `authorize.ts` | Controlla che `req.user.ruolo` corrisponda a uno dei ruoli consentiti. `authorizeDocente` controlla che `req.user.id === req.params.idDocente` |
| `upload.ts` | Configura multer per upload file. Salva in `uploads/` con nome timestamp-nomeoriginale. Limite 10 MB. Filtro: immagini, PDF, documenti Office |

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
   jwt.sign() → { id, nome, cognome, email, role, token }
```

## Flusso (esempio: cambio password, autenticato)

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

## Flusso (recupero password con codice di verifica)

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
       ※ NON consuma il codice (riusabile)
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

---

## Allineamento con frontend Angular

| Angular chiama | Backend risponde |
|---|---|
| `POST /api/login` | `{ id, nome, cognome, email, role, token }` |
| `POST /api/registrazione` | `{ id, nome, cognome, email, role, token }` (JWT, auto-login) |
| `POST /api/recupera-password` | `{ messaggio: "..." }` (invia codice 6 cifre via email) |
| `POST /api/auth/verifica-codice` | `{ valido: true }` o 401 (non consuma il codice) |
| `POST /api/reset-password` | `{ messaggio: "Password reimpostata con successo." }` (consuma il codice) |
| `POST /api/auth/change-password` | `{ messaggio: "Password cambiata con successo." }` |
| `GET /api/auth/profile` | `{ id, nome, cognome, email, role, ... }` |
| `POST /api/auth/refresh` | `{ accessToken, refreshToken }` |
| `GET /api/corsi-di-studio` | `[{ id_corso_di_studi, nome }]` |

**Convenzioni:**
- **Porta**: backend su `5000` (Angular chiama `ip:5000`)
- **camelCase**: i body usano camelCase (`corsoDiStudi`, `nuovaPassword`) — il service mappa a snake_case per Prisma
- **Amministratore**: non ha `cognome` nello schema; login e profilo restituiscono `cognome: ''`
- **Role case**: il backend usa ruoli in **MAIUSCOLO** (`STUDENTE`, `DOCENTE`, `AMMINISTRATORE`); il frontend li normalizza in **lowercase** (`studente`, `docente`, `amministratore`) all'arrivo della risposta
- **CorsoDiStudi**: entità autonoma (non enum) per permettere gestione admin. `Docente` può insegnare in più CorsoDiStudi (tabella join `DocenteCorsoDiStudi`). `Studente` ha FK `id_corso_di_studi`. `Bacheca` appartiene a `CorsoDiStudi` anziché a `Corso`.
- **materia docente**: non è più un campo diretto su `Docente`. Si deriva da `docente.corsi[0]?.nome_corso` nel response.
- **luogo**: nei response delle prenotazioni, `luogo` è una stringa formattata "Aula 5, Edificio D (Primo piano)". L'oggetto completo è disponibile in `luogoRicevimento`.

---

## TODO — Implementazione completata

| Fase | Cosa implementata | Stato |
|------|-------------------|-------|
| 1 | Setup DB, script `setup-db.sh`/`setup-db.js`, migrazioni, seed dati | ✅ |
| 2 | Auth: login JWT, middleware, profile, refresh, cambio/reset password, register admin | ✅ |
| 3 | CRUD Corsi, associazione corso ↔ docente | ✅ |
| 4 | CRUD Bacheca e FAQ | ✅ |
| 5 | CRUD SlotRicevimento e LuogoRicevimento | ✅ |
| 6 | CRUD Prenotazione, gestione stato | ✅ |
| 7 | CRUD Notifiche (multi-ruolo: studente, docente, admin) | ✅ |
| 8 | Amministratore: dashboard, statistiche, gestione utenti, slot globali, gestione prenotazioni | ✅ |
| 9 | Documenti: upload/download per prenotazioni | ✅ |
| 10 | Segnalazioni: backend completo + frontend admin | ✅ |
| 11 | Blocca giorni: modello GiornoBloccato, API backend, pagina admin | ✅ |

### Task aggiuntivi

- [x] Amministratore: CRUD slot (creare, modificare, eliminare slot dalla dashboard)
- [x] Amministratore: gestione segnalazioni (tabella, filtri, cambio stato)
- [x] Amministratore: gestire prenotazioni (cambio stato, elimina, dettagli)
- [x] Amministratore: bloccare giorni dal calendario (es. festivi)
- [x] Docente: aggiornamento profilo, segnalazioni
- [x] Corsi di studio: endpoint pubblico `/api/corsi-di-studio`

### Bug fix applicati

- **[14/05/2026] piano edificio non numerico**: `docenti.service.ts` — rimosso `parseInt()` su `s.luogo.piano` che causava `NaN` per valori non numerici come "Primo piano" o "Piano terra". Il campo è ora gestito come stringa, allineato con l'interfaccia frontend.
- **[22/05/2026] DB: aggiunto `id_corso_di_studi` a `Corso`**: nuova FK opzionale verso `CorsoDiStudi`. Migrazione `add_corso_corso_di_studi`. Seed aggiornato con associazioni corso → CorsoDiStudi e nuovo docente Elena Colombo per Matematica.
- **[22/05/2026] Backend: `docenti.service.ts` — response unificati**: `getElencoDocenti` ora restituisce anche `corsi[]` (id+nome). `getDettagliDocente` ora include `materia` e `corsoDiStudi: string[]` per consistenza.
- **[26/05/2026] FAQ: aggiunto `id_docente`**: nuovo campo opzionale sul modello FAQ per associare una FAQ a un docente specifico. Frontend aggiornato con selettore per filtrare FAQ per docente.
- **[30/05/2026] `bloccaGiorno()` — eliminazione slot/prenotazioni + notifica docenti**: `admin.service.ts` — `bloccaGiorno()` ora elimina in transazione atomica documenti, prenotazioni, luogo e slot per la data bloccata, e invia notifica `'giorno_bloccato'` a ogni docente con slot eliminati.

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

### 2. Autenticazione a due fattori (2FA)

Il login supporta già controllo 2FA lato service, ma endpoint e frontend non sono ancora implementati:
- Nuovi campi `two_factor_abilitato` su Studente/Docente/Amministratore (migrazione DB)
- Endpoint: `/api/auth/verifica-2fa`, `/api/auth/2fa/abilita`, `/api/auth/2fa/conferma`, `/api/auth/2fa/disabilita`, `/api/auth/2fa/stato`
- Frontend: pagina `/verifica-2fa` e toggle 2FA nei profili

### 3. Registrazione docente — selezione corso di studi e corso

Quando un docente crea/aggiorna il suo profilo, deve poter selezionare:
- **Corso di studi** (`GET /api/corsi-di-studio`)
- **Corso insegnato** (`GET /api/corsi`, filtrato per corso di studi)

### 4. Spostamento toggle tema

- **Rimuovere** il pulsante `<button class="toggle-tema">` da `topbar.component.html`
- **Aggiungere** un `ion-toggle` "Tema scuro" nelle pagine profilo studente e docente

---

## Mappatura Funzionalità → File Completa

Ogni funzionalità elenca: route frontend, pagina Angular, servizi frontend usati, endpoint backend, controller, service backend e modelli DB coinvolti.

### 1. Landing & Autenticazione

#### 1.1 Home
| Ruolo | Percorso |
|-------|----------|
| Frontend | `pg_frontend/src/app/features/home/home.page.ts` |
| Template | `home.page.html` |
| Stili | `home.page.scss` |
| Route | `/home` (pubblica) |

#### 1.2 Login
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/auth/login/login.page.ts` |
| Frontend service | `core/services/auth.ts` → `login()` |
| Backend route | `POST /api/login` |
| Backend controller | `controllers/auth.controller.ts` → `login` |
| Backend service | `services/auth.service.ts` → `login()` |
| Modelli DB | Studente, Docente, Amministratore |

#### 1.3 Registrazione Studente
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/auth/registrazione/registrazione.page.ts` |
| Frontend service | `core/services/auth.ts` → `registraStudente()`, `getCorsiDiStudio()` |
| Backend route | `POST /api/registrazione` |
| Backend controller | `controllers/auth.controller.ts` → `registerStudente` |
| Backend service | `services/auth.service.ts` → `registerStudente()` |
| Backend validators | `validators/auth.validators.ts` → `studenteRegistrationSchema` |
| Modelli DB | Studente, CorsoDiStudi |

#### 1.4 Recupero Password
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/auth/recupera-password/recupera-password.page.ts` |
| Frontend service | `core/services/auth.ts` → `richiediResetPassword()`, `verificaCodice()`, `confermaResetPassword()` |
| Backend routes | `POST /api/recupera-password`, `POST /api/auth/verifica-codice`, `POST /api/reset-password` |
| Backend controller | `controllers/auth.controller.ts` → `forgotPassword`, `verificaCodice`, `resetPassword` |
| Backend service | `services/auth.service.ts`, `services/codice-verifica.service.ts`, `services/email.service.ts` |
| Modelli DB | CodiceVerifica, Studente, Docente, Amministratore |

#### 1.5 Reset Password
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/auth/reset-password/reset-password.page.ts` |
| Frontend service | `core/services/auth.ts` → `confermaResetPassword()` |
| Backend route | `POST /api/reset-password` |
| Modelli DB | CodiceVerifica |

### 2. Funzionalità Studente

#### 2.1 Dashboard Studente
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/studente/dashboard-studente/dashboard-studente.page.ts` |
| Template | `dashboard-studente.page.html` |
| Stili | `dashboard-studente.page.scss` |
| Route | `/dashboard-studente` (auth + role: studente) |
| Frontend services | `PrenotazioneService`, `AuthService`, `BachecaService`, `StudenteService` |
| Backend APIs | `GET /api/studenti/:matricola`, `GET /api/prenotazioni/studente/:matricola`, `GET /api/corsi`, `GET /api/bacheche/corso-di-studi/:id` |
| Modelli DB | Studente, Prenotazione, Corso, Bacheca, FAQ |

#### 2.2 Elenco Docenti
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/studente/elenco-docenti/elenco-docenti.page.ts` |
| Route | `/elenco-docenti` |
| Frontend services | `AuthService`, `StudenteService`, `DocenteService` |
| Backend APIs | `GET /api/docenti`, `GET /api/corsi-di-studio` |
| Modelli DB | Docente, CorsoDiStudi |

#### 2.3 Prenota Ricevimento
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/studente/prenota/prenota.page.ts` |
| Route | `/prenota` |
| Frontend services | `DocenteService`, `PrenotazioneService`, `AuthService`, `StudenteService`, `AdminService` |
| Backend APIs | `GET /api/docenti/:idDocente/slots`, `GET /api/admin/giorni-bloccati`, `POST /api/prenotazioni` |
| Backend route | `routes/prenotazioni.routes.ts` → `POST /api/prenotazioni` |
| Backend upload | `middleware/upload.ts` (multer, max 10MB, filtri MIME) |
| Modelli DB | SlotRicevimento, Prenotazione, Documento, GiornoBloccato |

#### 2.4 Riepilogo Prenotazioni
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/studente/riepilogo-prenotazioni/riepilogo-prenotazioni.page.ts` |
| Route | `/riepilogo-prenotazioni` |
| Frontend services | `AuthService`, `PrenotazioneService`, `StudenteService` |
| Backend APIs | `GET /api/prenotazioni/studente/:matricola`, `DELETE /api/prenotazioni/:id/fisico` |
| Modelli DB | Prenotazione |

#### 2.5 Dettaglio Prenotazione (con mappa Leaflet)
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/studente/dettaglio-prenotazione/dettaglio-prenotazione.page.ts` |
| Route | `/dettaglio-prenotazione/:id` |
| Frontend services | `PrenotazioneService`, `AuthService` |
| Backend API | `GET /api/prenotazioni/:id` |
| Modelli DB | Prenotazione, LuogoRicevimento, Documento |

#### 2.6 Profilo Studente
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/studente/profilo-studente/profilo-studente.page.ts` |
| Route | `/profilo-studente` |
| Frontend services | `AuthService`, `StudenteService`, `ErroriService` |
| Backend routes | `routes/studenti.routes.ts` |
| Backend APIs | `GET /api/studenti/:matricola`, `PUT /api/studenti/:matricola`, `POST /api/auth/change-password`, `DELETE /api/studenti/:matricola` |
| Modelli DB | Studente |

#### 2.7 Bacheca / FAQ
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/studente/bacheca-studente/bacheca-studente.page.ts` |
| Route | `/bacheca-studente` |
| Frontend services | `BachecaService`, `AuthService`, `StudenteService` |
| Backend APIs | `GET /api/bacheche/corso-di-studi/:idCorsoDiStudi`, `GET /api/corsi-di-studio` |
| Backend files | `routes/bacheche.routes.ts`, `controllers/bacheca.controller.ts`, `services/bacheca.service.ts` |
| Modelli DB | Bacheca, FAQ, CorsoDiStudi, Corso |

#### 2.8 Notifiche Studente
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/studente/notifiche-studente/notifiche-studente.page.ts` |
| Template | `notifiche-studente.page.html` |
| Route | `/notifiche-studente` |
| Frontend services | `NotificaService`, `AuthService` |
| Backend routes | `routes/notifiche.routes.ts` |
| Backend APIs | `GET /api/notifiche/:id`, `PATCH /api/notifiche/:id/letta`, `POST /api/.../letta-tutte`, `DELETE /api/.../lette` |
| Backend files | `controllers/notifiche.controller.ts`, `services/notifiche.service.ts` |
| Modelli DB | Notifica |

#### 2.9 Segnalazioni Studente
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/studente/segnalazioni-studente/segnalazioni-studente.page.ts` |
| Route | `/segnalazioni-studente` |
| Frontend services | `SegnalazioneService`, `AuthService`, `ErroriService` |
| Backend routes | `routes/segnalazioni.routes.ts` |
| Backend files | `controllers/segnalazioni.controller.ts`, `services/segnalazioni.service.ts` |
| Modelli DB | Segnalazione |

### 3. Funzionalità Docente

#### 3.1 Dashboard Docente
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/docente/dashboard-docente/dashboard-docente.page.ts` |
| Route | `/dashboard-docente` |
| Frontend services | `AuthService`, `PrenotazioneService`, `DocenteService` |
| Backend APIs | `GET /api/prenotazioni/docente/:id`, `GET /api/docenti/:idDocente/statistiche` |
| Modelli DB | Prenotazione, SlotRicevimento |

#### 3.2 Gestione Slot (con mappa Leaflet)
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/docente/gestione-slot/gestione-slot.page.ts` |
| Route | `/gestione-slot` |
| Frontend services | `AuthService`, `DocenteService` |
| Backend routes | `routes/docenti.routes.ts` |
| Backend APIs | `GET/POST/PUT/DELETE /api/docenti/:idDocente/slots` |
| Backend files | `controllers/docenti.controller.ts`, `services/docenti.service.ts` |
| Validators | `validators/docenti.validators.ts` |
| Modelli DB | SlotRicevimento, LuogoRicevimento |

#### 3.3 Gestione Prenotazioni Ricevute
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/docente/prenotazioni-ricevute/prenotazioni-ricevute.page.ts` |
| Route | `/prenotazioni-ricevute` |
| PDF utility | `pdf-generator.ts` (export agenda giornaliera) |
| Frontend services | `AuthService`, `PrenotazioneService` |
| Backend APIs | `GET /api/prenotazioni/docente/:idDocente`, `PUT /api/prenotazioni/:id/stato` |
| Modelli DB | Prenotazione |

#### 3.4 Dettaglio Prenotazione Docente
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/docente/dettaglio-prenotazione-docente/dettaglio-prenotazione-docente.page.ts` |
| Route | `/dettaglio-prenotazione-docente/:id` |
| Frontend services | `PrenotazioneService`, `AuthService` |
| Backend API | `GET /api/prenotazioni/:id`, `POST /api/prenotazioni/:id/documenti` |
| Backend upload | `middleware/upload.ts` |
| Modelli DB | Prenotazione, Documento |

#### 3.5 Bacheche e FAQ (Docente)
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/docente/bacheche-docente/bacheche-docente.page.ts` |
| Route | `/bacheche-docente` |
| Frontend services | `BachecaService` |
| Backend APIs | `GET /api/bacheche/docente/me`, `POST /api/bacheche/corso/:idCorso/faq`, `PUT/DELETE /api/faq/:id` |
| Backend files | `routes/bacheche.routes.ts`, `controllers/bacheca.controller.ts`, `services/bacheca.service.ts` |
| Modello DB | Bacheca, FAQ |

#### 3.6 Statistiche Docente
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/docente/statistiche-docente/statistiche-docente.page.ts` |
| Route | `/statistiche-docente` |
| Frontend services | `AuthService`, `PrenotazioneService`, `DocenteService` |
| Backend API | `GET /api/docenti/:idDocente/statistiche` |
| Modello DB | Prenotazione |

#### 3.7 Documenti (Docente)
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/docente/documenti-docente/documenti-docente.page.ts` |
| Route | `/documenti-docente` |
| Frontend services | `AuthService`, `PrenotazioneService` |
| Backend APIs | `GET /api/prenotazioni/docente/:idDocente` |
| Modello DB | Documento, Prenotazione |

#### 3.8 Profilo Docente
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/docente/profilo-docente/profilo-docente.page.ts` |
| Route | `/profilo-docente` |
| Frontend services | `AuthService`, `DocenteService` |
| Backend route | `PUT /api/docenti/:idDocente/profilo` |
| Backend files | `routes/docenti.routes.ts`, `controllers/docenti.controller.ts`, `services/docenti.service.ts` |
| Validators | `validators/docenti.validators.ts` → `aggiornaProfiloSchema` |
| Modello DB | Docente |

#### 3.9 Notifiche Docente
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/docente/notifiche-docente/notifiche-docente.page.ts` |
| Route | `/notifiche-docente` |
| Frontend services | `NotificaService`, `AuthService`, `ErroriService` |
| Backend routes | `routes/notifiche.routes.ts` |
| Backend files | `controllers/notifiche.controller.ts`, `services/notifiche.service.ts` |
| Modello DB | Notifica |

#### 3.10 Segnalazioni Docente
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/docente/segnalazioni-docente/segnalazioni-docente.page.ts` |
| Route | `/segnalazioni-docente` |
| Frontend services | `SegnalazioneService`, `AuthService` |
| Backend routes | `routes/segnalazioni.routes.ts` → `POST /api/segnalazioni/docente`, `GET /api/segnalazioni/docente/:idDocente` |
| Modello DB | Segnalazione |

### 4. Funzionalità Admin

#### 4.1 Dashboard Admin
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/admin/dashboard-admin/dashboard-admin.page.ts` |
| Route | `/dashboard-admin` |
| Frontend service | `AdminService` |
| Backend API | `GET /api/admin/stats` |
| Backend files | `routes/admin.routes.ts`, `controllers/admin.controller.ts`, `services/admin.service.ts` |
| Modelli DB | Studente, Docente, Prenotazione, SlotRicevimento |

#### 4.2 Gestione Account
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/admin/gestione-account/gestione-account.page.ts` |
| Route | `/gestione-account` |
| Frontend services | `AdminService`, `AuthService` |
| Backend APIs | `GET/POST/PUT/DELETE /api/admin/utenti` |
| Backend validators | `validators/admin.validators.ts` |
| Modelli DB | Studente, Docente, Amministratore, CorsoDiStudi |

#### 4.3 Gestione Slot (Admin)
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/admin/gestione-slot-admin/gestione-slot-admin.page.ts` |
| Route | `/gestione-slot-admin` |
| Frontend service | `AdminService` |
| Backend APIs | `GET/POST/PUT/DELETE /api/admin/slot`, `GET /api/admin/slot-date` |
| Modelli DB | SlotRicevimento, LuogoRicevimento |

#### 4.4 Gestione Segnalazioni
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/admin/gestione-segnalazioni/gestione-segnalazioni.page.ts` |
| Route | `/gestione-segnalazioni` |
| Frontend service | `SegnalazioneService` |
| Backend APIs | `GET /api/segnalazioni/admin/all`, `PATCH /api/segnalazioni/:id/stato`, `DELETE /api/segnalazioni/:id` |
| Modello DB | Segnalazione |

#### 4.5 Gestione Prenotazioni (Admin)
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/admin/gestione-prenotazioni-admin/gestione-prenotazioni-admin.page.ts` |
| Route | `/gestione-prenotazioni-admin` |
| Frontend service | `AdminService` |
| Backend APIs | `GET /api/admin/prenotazioni`, `PUT /api/admin/prenotazioni/:id/stato`, `DELETE /api/admin/prenotazioni/:id` |
| Modello DB | Prenotazione |

#### 4.6 Gestione Calendario (Giorni Bloccati)
| Ruolo | File |
|-------|------|
| Frontend page | `pg_frontend/src/app/features/admin/gestione-calendario/gestione-calendario.page.ts` |
| Route | `/gestione-calendario` |
| Frontend service | `AdminService` |
| Backend APIs | `GET/POST /api/admin/giorni-bloccati`, `DELETE /api/admin/giorni-bloccati/:id` |
| Modello DB | GiornoBloccato |

### 5. Infrastruttura Condivisa

#### 5.1 Sistema Notifiche
| Componente | File |
|------------|------|
| Backend route | `routes/notifiche.routes.ts` |
| Backend controller | `controllers/notifiche.controller.ts` |
| Backend service | `services/notifiche.service.ts` |
| Frontend service | `core/services/notifica.ts` (con BehaviorSubject `nonLette$`) |
| Frontend badge | `components/topbar/topbar.component.ts` (sottoscrizione a `nonLette$`) |
| Pagine frontend | `notifiche-studente.page.ts`, `notifiche-docente.page.ts` |
| Modello DB | Notifica |

#### 5.2 Upload File
| Componente | File |
|------------|------|
| Middleware | `middleware/upload.ts` (multer, MIME filter, 10MB limit) |
| Static serve | `app.ts` (`/uploads` mount) |
| Route prenotazioni | `routes/prenotazioni.routes.ts` |
| Route segnalazioni | `routes/segnalazioni.routes.ts` |
| Modello DB | Documento |

#### 5.3 Reminder Automatici
| Componente | File |
|------------|------|
| Servizio | `services/reminder.service.ts` (cron job, X ore prima) |
| Avvio | `server.ts` |
| Modelli DB | Prenotazione, Notifica, Docente, Studente |

#### 5.4 Auth & Sicurezza
| Componente | File |
|------------|------|
| JWT middleware | `middleware/authenticate.ts` |
| Role middleware | `middleware/authorize.ts` |
| Auth service | `services/auth.service.ts` |
| Auth controller | `controllers/auth.controller.ts` |
| Auth routes | `routes/auth.routes.ts` |

#### 5.5 Componenti UI Condivisi
| Componente | File |
|------------|------|
| Dashboard layout | `components/dashboard-layout/dashboard-layout.component.ts` |
| Sidebar | `components/sidebar/sidebar.component.ts` |
| Topbar | `components/topbar/topbar.component.ts` |
| Routing | `app.routes.ts` (27 rotte) |
| Auth guard | `core/guards/auth-guard.ts` |
| Auth interceptor | `core/interceptors/auth-interceptor.ts` |
| Modelli condivisi | `core/models/interfacce.ts` |

#### 5.6 Modelli Database (Prisma)
| File | Contenuto |
|------|-----------|
| `prisma/schema.prisma` | 15 modelli: CorsoDiStudi, Studente, Docente, DocenteCorsoDiStudi, Amministratore, Corso, Bacheca, FAQ, SlotRicevimento, LuogoRicevimento, Prenotazione, Documento, Notifica, GiornoBloccato, CodiceVerifica |
| `prisma/seed.ts` | Dati di test dinamici (date relative a oggi) |

---

## Bug Fix Applicati

| Data | Fix | File |
|------|-----|------|
| 31/05/2026 | **Slot non liberato su rifiuto/annullamento prenotazione** — `aggiornaStatoPrenotazione()` ora imposta `disponibilita = true` quando lo stato diventa `RIFIUTATA` o `ANNULLATA` | `services/prenotazioni.service.ts` |
| 31/05/2026 | **Slot non liberato su eliminazione fisica** — `eliminaPrenotazione()` ora riapre lo slot prima di cancellare la prenotazione | `services/prenotazioni.service.ts` |
| 31/05/2026 | **File type validation** — multer ora filtra MIME types, blocca `.exe`, `.sh`, `.html`, ecc. | `middleware/upload.ts` |
| 31/05/2026 | **CORS ristretto** — solo `localhost:4200` e `localhost:8100` | `app.ts` |
| 31/05/2026 | **Admin auth su giorni-bloccati** — `GET /admin/giorni-bloccati` ora richiede ruolo AMMINISTRATORE | `routes/admin.routes.ts` |
| 31/05/2026 | **Validazione profilo docente** — aggiunto schema validazione `aggiornaProfiloSchema` su `PUT /docenti/:id/profilo` | `validators/docenti.validators.ts`, `routes/docenti.routes.ts` |
| 31/05/2026 | **JWT_REFRESH_SECRET separato** — aggiunta variabile d'ambiente dedicata (non più fallback a JWT_SECRET) | `.env` |
| 31/05/2026 | **Gestione errori multer** — global error handler restituisce JSON anziché HTML | `app.ts` |

---

## Vulnerabilità Note (Da Risolvere)

Le vulnerabilità qui elencate sono state identificate durante una security audit ma **non ancora corrette**.

### 🔴 Critiche

| # | Vulnerabilità | File | Descrizione |
|---|--------------|------|-------------|
| V1 | **IDOR prenotazioni** — qualsiasi utente autenticato può leggere/modificare/cancellare qualsiasi prenotazione | `routes/prenotazioni.routes.ts:16-22` | `GET /:id`, `DELETE /:id`, `PUT /:id/stato`, `POST /:id/documenti` — nessun controllo che la prenotazione appartenga all'utente |
| V2 | **IDOR profilo studente** — qualsiasi utente può leggere/modificare profili altrui | `routes/studenti.routes.ts:8-9` | `GET/PUT /studenti/:matricola` non verifica `req.user.id === matricola` |
| V4 | **IDOR notifiche** — qualsiasi utente legge notifiche di chiunque | `routes/notifiche.routes.ts:14-18` | `GET /notifiche/:destinatarioId`, `PATCH /:id/letta`, `POST /:id/letta-tutte`, `DELETE /:id/lette` |
| V5 | **IDOR segnalazioni** — qualsiasi utente legge segnalazioni altrui | `routes/segnalazioni.routes.ts:26-30,64-68` | `GET /segnalazioni/studente/:matricola`, `GET /segnalazioni/docente/:idDocente` |
| V6 | **Booking impersonation** — uno studente può prenotare per un altro | `routes/prenotazioni.routes.ts:15` | `POST /prenotazioni` accetta `matricolaStudente` dal body senza verificarlo col token |

### 🟡 Alte

| # | Vulnerabilità | File | Descrizione |
|---|--------------|------|-------------|
| V10 | **Rate limiting assente** — nessuna protezione su login/registrazione/verifica-codice | tutti i route | Brute force password e codice reset possibili |
| V11 | **Stored XSS** — input utente non sanitizzato prima del DB | `bacheca.service.ts`, `segnalazioni.service.ts`, `prenotazioni.service.ts` | Domanda FAQ, descrizione segnalazione, argomento prenotazione |
| V12 | **Upload HTML/SVG** — nonostante il MIME filter, file rinominati potrebbero eluderlo | `middleware/upload.ts` | File `.html` rinominati come `.pdf`? Da verificare comportamento client |
| V14 | **Email enumeration** — registrazione risponde "Email già in uso" | `controllers/auth.controller.ts:21-50` | Attaccante enumera email valide |

### 🟢 Medie

| # | Vulnerabilità | File | Descrizione |
|---|--------------|------|-------------|
| V15 | **CORS** — lista origini da estendere in produzione | `app.ts` | Aggiungere dominio di produzione |
| V16 | **Bcrypt rounds** — 10 rounds, best practice 12-14 | `services/auth.service.ts:7` | Aumentare salt rounds |
| V17 | **Password reset code 6 cifre** — senza rate limiting è bruteforcabile | `services/codice-verifica.service.ts:6` | Aggiungere rate limiting o aumentare complessità |
| V18 | **Password minima 8 char** — nessun requisito di complessità | `validators/auth.validators.ts` | Aggiungere maiuscola, numero, carattere speciale |
| V19 | **No HTTPS** — traffico in chiaro | `server.ts:36` | Configurare TLS in produzione |
| V20 | **No audit log** — nessuna traccia di operazioni sensibili | — | Aggiungere logging per login falliti, cancellazioni, azioni admin |

### 🟢 Basse

| # | Vulnerabilità | File | Descrizione |
|---|--------------|------|-------------|
| V21 | **No refresh token rotation** — token rubato usabile 7 giorni | `services/auth.service.ts:209-217` | Implementare rotazione |
| V22 | **Errori specifici** — "Studente not found", "Slot not found" leak esistenza | vari controllers | Uniformare a messaggi generici |
| V23 | **Informazioni sensibili in getPrenotazioneById** — email studente esposta | `services/prenotazioni.service.ts:317` | Rimuovere email dal response se non necessaria |
