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
├── TODO.md
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

`prisma/seed.ts` popola il database con dati di esempio:

| Tabella | Righe | Dettaglio |
|---------|-------|-----------|
| Studente | 5 | Mario Rossi, Lisa Bianchi, Luca Ferrari, Sofia Romano, Marco Esposito |
| Docente | 4 | Giuseppe Verdi, Anna Neri, Maria Bianco, Paolo Russo |
| Amministratore | 2 | Admin, Super Admin |
| Corso | 5 | Programmazione Web, Basi di Dati, Ingegneria del Software, Reti di Calcolatori, Intelligenza Artificiale |
| Bacheca | 3 | Una per ogni corso principale |
| FAQ | 6 | Domande/Risposte distribuite tra le bacheche |
| SlotRicevimento | 6 | Distribuiti tra i vari docenti in date diverse |
| LuogoRicevimento | 3 | Aula 5, Studio 12, Lab 3 |
| Prenotazione | 5 | Stati: CONFERMATO, IN_ATTESA, RIFIUTATO |
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
| `auth.service.ts` | Registrazione (studente/docente/admin), login, profilo, refresh token, cambio/reset password, JWT |
| `studenti.service.ts` | Profilo studente (GET, PUT) |
| `docenti.service.ts` | Elenco/dettagli docenti, CRUD slot ricevimento, statistiche |
| `prenotazioni.service.ts` | CRUD prenotazioni, gestione stato (IN_ATTESA → CONFERMATA/ANNULLATA) |
| `segnalazioni.service.ts` | CRUD segnalazioni, cambio stato, filtri admin |
| `admin.service.ts` | Statistiche dashboard, gestione utenti (CRUD), slot globali (CRUD + filtri + date disponibili) |
| `corsi.service.ts` | ✅ CRUD corsi, associazione corso ↔ docente |
| `bacheca.service.ts` | ✅ CRUD bacheca (una per corso), CRUD FAQ |
| `documenti.service.ts` | *(da implementare)* Upload/download documenti |
| `notifiche.service.ts` | *(da implementare)* CRUD notifiche |

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
| `/api/recupera-password` | POST | Richiedi reset password |
| `/api/reset-password` | POST | Conferma reset con token |
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
| `/api/prenotazioni` | POST | JWT | Crea prenotazione |
| `/api/prenotazioni/:id` | DELETE | JWT | Annulla prenotazione |
| `/api/prenotazioni/studente/:matricolaStudente` | GET | JWT | Prenotazioni dello studente |
| `/api/prenotazioni/docente/:idDocente` | GET | JWT | Prenotazioni del docente |
| `/api/prenotazioni/:id/stato` | PUT | JWT | Aggiorna stato prenotazione |

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
| `/api/bacheche/:idCorso` | GET | - | Bacheca di un corso (con FAQ) |
| `/api/bacheche/:idCorso` | PUT | JWT (DOCENTE, AMMINISTRATORE) | Aggiorna bacheca |
| `/api/bacheche/:idCorso/faq` | GET | - | FAQ della bacheca |
| `/api/bacheche/:idCorso/faq` | POST | JWT (DOCENTE, AMMINISTRATORE) | Crea FAQ |
| `/api/faq/:id` | PUT | JWT (DOCENTE, AMMINISTRATORE) | Modifica FAQ |
| `/api/faq/:id` | DELETE | JWT (DOCENTE, AMMINISTRATORE) | Elimina FAQ |

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

export const handleValidationErrors = (req, res, next) => {
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
| `auth.validators.ts` | Login, registrazione (studente/docente/admin), cambio/reset password, refresh token |
| `admin.validators.ts` | Creazione/modifica utenti admin, filtri slot globali |
| `studenti.validators.ts` | Aggiornamento profilo studente |
| `docenti.validators.ts` | Creazione/modifica slot, filtri mese |
| `prenotazioni.validators.ts` | Creazione prenotazione, aggiornamento stato |
| `segnalazioni.validators.ts` | Creazione segnalazione, aggiornamento stato |
| `corsi.validators.ts` | ✅ Creazione/modifica corsi |
| `bacheca.validators.ts` | ✅ Aggiornamento bacheca, creazione/modifica FAQ |
| `notifiche.validators.ts` | *(da implementare)* Creazione notifiche |
| `documenti.validators.ts` | *(da implementare)* Upload documenti |

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
|---|---|
| `POST /api/login` | `{ id, nome, cognome, email, role, token }` |
| `POST /api/registrazione` | `{ id, nome, cognome, email, role, token }` (JWT, auto-login) |
| `POST /api/recupera-password` | `{ messaggio: "...", resetToken }` |
| `POST /api/reset-password` | `{ messaggio: "Password reimpostata con successo." }` |

**Convenzioni:**
- **Porta**: backend su `5000` (Angular chiama `ip:5000`)
- **camelCase**: i body usano camelCase (`corsoDiStudi`, `nuovaPassword`) — il service mappa a snake_case per Prisma
- **Amministratore**: non ha `cognome` nello schema; login e profilo restituiscono `cognome: ''`
- **Role case**: il backend usa ruoli in **MAIUSCOLO** (`STUDENTE`, `DOCENTE`, `AMMINISTRATORE`); il frontend li normalizza in **lowercase** (`studente`, `docente`, `amministratore`) all'arrivo della risposta in `AuthService.login()` e `loadSessionFromStorage()`

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
| 7 | CRUD Notifiche | ❌ |
| 8 | Amministratore: dashboard, statistiche, gestione utenti, slot globali (CRUD completo + filtri) | ✅ |
| 9 | CRUD Documenti (upload/download per prenotazioni) | ❌ |
| 10 | CRUD Segnalazioni: backend (routes, controller, service, validators) + frontend admin (pagina gestione) | ✅ |
| 11 | Blocca giorni: modello GiornoBloccato, API backend, pagina admin gestione-calendario | ✅ |

### Dettaglio API ancora da implementare

#### Fase 7 — Notifiche ⚠️ controller/routes esistenti ma vuoti
- `notifiche.controller.ts` e `notifiche.routes.ts` esistono come file vuoti
- Manca: `notifiche.service.ts`, `notifiche.validators.ts`
- `GET /api/notifiche` — elenco notifiche (autenticato)
- `POST /api/notifiche` — crea notifica (autenticato)
- `PUT /api/notifiche/:id/letta` — segna come letta (autenticato)
- `DELETE /api/notifiche/:id` — elimina notifica (autenticato)

#### Fase 10 ✅ — Segnalazioni (`segnalazioni.routes.ts`, `segnalazioni.controller.ts`, `segnalazioni.service.ts`, `segnalazioni.validators.ts`)
- `POST /api/segnalazioni` — crea segnalazione (autenticato)
- `GET /api/segnalazioni/studente/:matricola` — segnalazioni di uno studente (autenticato)
- `GET /api/segnalazioni/admin/all` — tutte le segnalazioni con dati studente (admin, filtro `?stato=`)
- `PATCH /api/segnalazioni/:id/stato` — cambia stato (`APERTA` / `IN_LAVORAZIONE` / `CHIUSA`) (admin)

#### Fase 9 — Documenti (`documenti.routes.ts`, `documenti.controller.ts`, `documenti.service.ts`)
- `POST /api/documenti/upload` — carica file (multipart, autenticato)
- `GET /api/documenti/:id` — scarica file (autenticato)
- `GET /api/prenotazioni/:id/documenti` — documenti di una prenotazione (autenticato)
- `DELETE /api/documenti/:id` — elimina documento (autenticato)

### Task aggiuntivi

- [x] Amministratore: CRUD slot (creare, modificare, eliminare slot dalla dashboard)
- [x] Amministratore: gestione segnalazioni (tabella, filtri, cambio stato)
- [ ] Amministratore: gestire prenotazioni (eliminarle o modificarle)
- [x] Amministratore: bloccare giorni dal calendario (es. festivi)
- [ ] Eliminare la possibilità di cambiare ruoli agli utenti (inutile)

---

> **Nota:** La pianificazione dettagliata della Fase 11 (Blocca giorni) è stata rimossa in quanto già implementata. Vedi sezione API admin per gli endpoint `/api/admin/giorni-bloccati`.
