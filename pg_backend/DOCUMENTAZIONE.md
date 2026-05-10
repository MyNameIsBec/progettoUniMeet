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
├── setup-db.sh                # Script automatizzato setup DB
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

`setup-db.sh` automatizza la creazione del database e l'applicazione delle migrazioni:

1. Verifica che PostgreSQL sia in esecuzione (`pg_isready`)
2. Crea il database `prenotazioni_db` se non esiste
3. Esegue `npx prisma migrate deploy` (applica migrazioni pendenti)
4. Genera il Prisma Client con `npx prisma generate`

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
| `corso.service.ts` *(to be added)* | CRUD corsi, associazione corso ↔ docente |
| `bacheca.service.ts` *(to be added)* | CRUD bacheca (una per corso) |
| `faq.service.ts` *(to be added)* | CRUD FAQ associate a una bacheca |
| `slot.service.ts` *(to be added)* | CRUD slot ricevimento (creati dal docente) |
| `luogo.service.ts` *(to be added)* | CRUD luogo associato a uno slot |
| `prenotazione.service.ts` *(to be added)* | CRUD prenotazione, gestione stato (IN_ATTESA → CONFERMATO/RIFIUTATO) |
| `notifica.service.ts` *(to be added)* | CRUD notifiche |
| `admin.service.ts` | Statistiche dashboard, gestione utenti (CRUD) |

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

Per le entity future (corsi, bacheche, slot, prenotazioni, notifiche):
- `/api/corsi` — `corso.routes.ts`
- `/api/bacheche` — `bacheca.routes.ts`
- `/api/faq` — `faq.routes.ts`
- `/api/slot` — `slot.routes.ts`
- `/api/luoghi` — `luogo.routes.ts`
- `/api/prenotazioni` — `prenotazione.routes.ts`
- `/api/notifiche` — `notifica.routes.ts`

Endpoint admin (`admin.routes.ts`):

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/admin/stats` | GET | Statistiche dashboard |
| `/api/admin/utenti` | GET | Lista utenti unificata (filtro `?ruolo=`) |
| `/api/admin/utenti` | POST | Creazione utente |
| `/api/admin/utenti/:id` | PUT | Modifica utente |
| `/api/admin/utenti/:id` | DELETE | Eliminazione utente |
| `/api/admin/slot` | GET | Lista slot globali (filtri `?docenteId=&data=&stato=`) |

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
| `POST /api/registrazione` | `{ messaggio: "Registrazione completata con successo." }` |
| `POST /api/recupera-password` | `{ messaggio: "...", resetToken }` |
| `POST /api/reset-password` | `{ messaggio: "Password reimpostata con successo." }` |

**Convenzioni:**
- **Porta**: backend su `5000` (Angular chiama `ip:5000`)
- **camelCase**: i body usano camelCase (`corsoDiStudi`, `nuovaPassword`) — il service mappa a snake_case per Prisma
- **Amministratore**: non ha `cognome` nello schema; login e profilo restituiscono `cognome: ''`
- **Role case**: il backend usa ruoli in **MAIUSCOLO** (`STUDENTE`, `DOCENTE`, `AMMINISTRATORE`); il frontend li normalizza in **lowercase** (`studente`, `docente`, `amministratore`) all'arrivo della risposta in `AuthService.login()` e `loadSessionFromStorage()`

---

## TODO — 8 fasi di implementazione

| Fase | Cosa implementare | Stato |
|------|-------------------|-------|
| 1 | Setup DB, script `setup-db.sh`, migrazioni, seed dati | ✅ |
| 2 | Auth: login JWT, middleware, profile, refresh, cambio/reset password, register admin | ✅ |
| 3 | CRUD Corsi, associazione corso ↔ docente | ❌ |
| 4 | CRUD Bacheca e FAQ | ❌ |
| 5 | CRUD SlotRicevimento e LuogoRicevimento | ❌ |
| 6 | CRUD Prenotazione, gestione stato, upload documenti | ❌ |
| 7 | CRUD Notifiche | ❌ |
| 8 | Amministratore: dashboard, statistiche, gestione utenti, slot globali | ✅ |
