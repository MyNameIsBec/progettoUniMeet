# UniMeet — Piattaforma di Prenotazione Ricevimento

[![Angular](https://img.shields.io/badge/Angular-20-DD0031?logo=angular)](https://angular.dev)
[![Ionic](https://img.shields.io/badge/Ionic-8-3880FF?logo=ionic)](https://ionicframework.com)
[![Node](https://img.shields.io/badge/Node-18+-339933?logo=nodedotjs)](https://nodejs.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

Applicazione web per la gestione di prenotazioni di ricevimento tra studenti e docenti universitari.

- **Frontend**: Angular 20 (standalone components) + Ionic 8 + Leaflet 1.9
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 14+ + Prisma ORM 7

---

## Avvio rapido

### Prerequisiti

- **Node.js** 18+
- **npm**
- **PostgreSQL** 14+ (locale o Docker)

### 1. Clona e configura

```bash
git clone <repo-url>
cd progettoUniMeet
```

Modifica `pg_backend/.env` con le tue credenziali PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:YOLO@127.0.0.1:5432/prenotazioni_db?schema=public"
```

### 2. Avvia tutto con un comando

```bash
node start.js
```

Questo singolo comando:

1. Installa automaticamente le dipendenze (backend + frontend)
2. Verifica/avvia PostgreSQL (nativo o Docker)
3. Crea il database e applica le migrazioni
4. Popola con dati di test se il DB è vuoto
5. Avvia Backend su `http://localhost:5000`
6. Avvia Prisma Studio su `http://localhost:5557`
7. Avvia Frontend su `http://localhost:4200`
8. Apre automaticamente i browser
9. Si arresta con `Ctrl+C`

#### Flag opzionali

| Flag | Effetto |
|------|---------|
| `--no-start` | Solo install + setup DB + seed, non avvia i servizi |
| `--no-seed` | Salta il seed (solo setup DB) |
| `--reset` | Ricrea il database da zero (drop + create + setup + seed) |

```bash
node start.js                # install + setup + seed + start
node start.js --no-start     # solo setup
node start.js --no-seed      # setup + start, senza dati di test
node start.js --reset        # reset DB + re-seed + start
```

### 3. Avvio manuale (alternativa)

```bash
# Terminale 1 — Backend
cd pg_backend
npm install && node setup-db.js && npm run seed && npm run dev

# Terminale 2 — Frontend
cd pg_frontend && npm install && npx ionic serve
```

---

## Dati di test

> **Password comune**: `Password123`

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

### Seed dati

```bash
cd pg_backend && npm run seed
```

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

---

## Comandi utili

### Root

| Comando | Effetto |
|---------|---------|
| `node start.js` | Avvia tutto (install + setup DB + seed + servizi) |
| `node start.js --dev` | Modalità sviluppo (hot-reload) |
| `node start.js --reset` | Reset DB + re-seed + start |

### Backend (`pg_backend/`)

| Comando | Effetto |
|---------|---------|
| `npm run dev` | Server in sviluppo (hot reload) |
| `npm run build` | Compila TypeScript in JavaScript |
| `npm start` | Server dalla build compilata |
| `npm run seed` | Popola il DB con dati di test |
| `npx prisma studio` | GUI per esplorare i dati |
| `node setup-db.js` | Setup DB (cross-platform) |
| `./setup-db.sh` | Setup DB (Unix) |

### Frontend (`pg_frontend/`)

| Comando | Effetto |
|---------|---------|
| `npx ionic serve` | Dev server su `http://localhost:4200` |
| `npm run start` | Alternativa a `ionic serve` |
| `npm run build` | Build di produzione |
| `npm run test` | Test (Jasmine + Karma) |
| `npm run lint` | ESLint |

---

## Reset del database

```bash
# Da root (consigliato)
node start.js --reset

# Oppure manualmente
cd pg_backend
dropdb -U postgres prenotazioni_db
createdb -U postgres prenotazioni_db
node setup-db.js && npm run seed
```

---

## Email / Recupero password

Il server usa **nodemailer** per inviare codici OTP. Configura nel `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=la-tua-email@gmail.com
SMTP_PASS=la-tua-app-password
EMAIL_FROM=la-tua-email@gmail.com
```
