# UniMeet — Piattaforma di Prenotazione Ricevimento

Applicazione web per la gestione di prenotazioni di ricevimento tra studenti e docenti universitari.

- **Frontend**: Angular 20 (standalone) + Ionic 8
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM

---

## Prerequisiti

- **Node.js** 18+
- **npm**
- **PostgreSQL** 14+ (o Docker)

---

## Setup rapido

### 1. Clona e installa dipendenze

```bash
# Backend
cd pg_backend
npm install

# Frontend
cd ../pg_frontend
npm install
```

### 2. Avvia PostgreSQL

**Linux (systemd):**
```bash
sudo systemctl start postgresql
```

**macOS (Homebrew):**
```bash
brew services start postgresql@16
```

**Windows:**
```powershell
net start postgresql-<versione>
```

**Docker (alternativa):**
```bash
docker run -d --name pg_prenotazioni -e POSTGRES_PASSWORD=YOLO -e POSTGRES_DB=prenotazioni_db -p 5432:5432 postgres:latest
```

### 3. Configura il database

Assicurati che le credenziali in `pg_backend/.env` corrispondano al tuo DB locale:

```env
DATABASE_URL="postgresql://postgres:YOLO@127.0.0.1:5432/prenotazioni_db?schema=public"
```

Se il tuo utente PostgreSQL ha password diversa, modifica `YOLO`.

### 4. Avvio del backend

```bash
cd pg_backend
node setup-db.js    # crea DB, applica migrazioni, genera client
npm run seed        # popola con dati di test (opzionale ma consigliato)
npm run dev         # avvia server su http://localhost:5000
```

### 5. Avvio del frontend

```bash
cd pg_frontend
npx ionic serve     # avvia su http://localhost:8100
```

Oppure:

```bash
cd pg_frontend
npm run start       # alternativa a ionic serve
```

---

## Dati di test

### Password comune

> **⚠️ Tutti gli utenti condividono la password: `Password123`**

### Account disponibili

| Ruolo | Email | Nome |
|-------|-------|------|
| **Studente** | `mario.rossi@studenti.unimeet.it` | Mario Rossi |
| **Studente** | `lisa.bianchi@studenti.unimeet.it` | Lisa Bianchi |
| **Studente** | `luca.ferrari@studenti.unimeet.it` | Luca Ferrari |
| **Studente** | `sofia.romano@studenti.unimeet.it` | Sofia Romano |
| **Studente** | `marco.esposito@studenti.unimeet.it` | Marco Esposito |
| **Docente** | `giuseppe.verdi@unimeet.it` | Giuseppe Verdi |
| **Docente** | `anna.neri@unimeet.it` | Anna Neri |
| **Docente** | `maria.bianco@unimeet.it` | Maria Bianco |
| **Docente** | `paolo.russo@unimeet.it` | Paolo Russo |
| **Docente** | `elena.colombo@unimeet.it` | Elena Colombo |
| **Admin** | `admin@unimeet.it` | Admin |
| **Admin** | `superadmin@unimeet.it` | Super Admin |

### Seed dati (opzionale)

```bash
cd pg_backend
npm run seed
```

Inserisce nel database:

| Tabella | Righe |
|---------|-------|
| CorsoDiStudi | 3 |
| Studente | 5 |
| Docente | 5 |
| Amministratore | 2 |
| Corso | 7 |
| Bacheca | 3 |
| FAQ | 12 |
| SlotRicevimento | 6 |
| LuogoRicevimento | 3 |
| Prenotazione | 5 |
| Documento | 3 |
| File (`uploads/`) | 3 (placeholder) |

---

## Comandi utili

### Backend (`pg_backend/`)

| Comando | Cosa fa |
|---------|---------|
| `npm run dev` | Avvia il server in modalità sviluppo (hot reload) |
| `npm run build` | Compila TypeScript in JavaScript |
| `npm start` | Avvia il server dalla build compilata |
| `npm run seed` | Popola il DB con dati di test |
| `npx prisma studio` | Apri interfaccia grafica per esplorare i dati |
| `node setup-db.js` | Setup completo DB (cross-platform) |
| `./setup-db.sh` | Setup completo DB (Unix) |

### Frontend (`pg_frontend/`)

| Comando | Cosa fa |
|---------|---------|
| `npx ionic serve` | Avvia il dev server su `http://localhost:8100` |
| `npm run start` | Alternativa a `ionic serve` |
| `npm run build` | Build di produzione |
| `npm run test` | Esegue i test (Jasmine + Karma) |
| `npm run lint` | ESLint |

---

## Reset del database

```bash
cd pg_backend

# Elimina e ricrea il DB
dropdb -U postgres prenotazioni_db
createdb -U postgres prenotazioni_db

# Riapplica migrazioni e seed
node setup-db.js
npm run seed
```

---

## Email / Recupero password

Per l'invio dei codici OTP (recupero password, verifica email) il server usa **nodemailer**.

### Configurazione SMTP (`.env`)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=la-tua-email@gmail.com
SMTP_PASS=la-tua-app-password
EMAIL_FROM=la-tua-email@gmail.com
```

**Gmail:**
1. Attiva la **verifica in due passaggi** su https://myaccount.google.com/security
2. Genera una **App Password** su https://myaccount.google.com/apppasswords
3. Inserisci l'App Password in `SMTP_PASS`
4. `EMAIL_FROM` deve coincidere con `SMTP_USER`

**Altri provider:** modifica `SMTP_HOST` e `SMTP_PORT` di conseguenza.

Se `SMTP_USER` o `SMTP_PASS` sono vuoti, il server scrive il codice in console (utile in sviluppo).
