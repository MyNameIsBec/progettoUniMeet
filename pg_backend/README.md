# Backend Prenotazioni Ricevimento — Setup DB Locale

## Requisiti

- **PostgreSQL** (versione 14+)
- **Node.js** 18+
- **npm**

---

## Setup rapido

### 1. Avvia PostgreSQL

**Linux (systemd):**
```bash
sudo systemctl start postgresql
```

**macOS (Homebrew):**
```bash
brew services start postgresql@16
```

**Windows:** avvia il servizio da `Services` o con `pg_ctl`.

### 2. Configura il database

Assicurati che le credenziali in `.env` corrispondano al tuo DB locale:

```env
DATABASE_URL="postgresql://postgres:YOLO@127.0.0.1:5432/prenotazioni_db?schema=public"
```

Se il tuo utente PostgreSQL ha password diversa, modifica `YOLO`.

### 3. Esegui lo script di setup

```bash
cd pg_backend
chmod +x setup-db.sh
./setup-db.sh
```

Lo script:
1. Verifica che PostgreSQL sia in esecuzione
2. Crea il database `prenotazioni_db` se non esiste
3. Applica tutte le migrazioni Prisma
4. Genera il Prisma Client

### 4. Popola con dati di test (opzionale)

```bash
npm run seed
```

Inserisce nel database:

| Tabella | Righe |
|---------|-------|
| Studente | 5 |
| Docente | 4 |
| Amministratore | 2 |
| Corso | 5 |
| Bacheca | 3 |
| FAQ | 6 |
| SlotRicevimento | 6 |
| LuogoRicevimento | 3 |
| Prenotazione | 5 (CONFERMATO, IN_ATTESA, RIFIUTATO) |
| Documento | 3 |
| Notifica | 5 |

> **⚠️ Password di tutti gli utenti: `password123`**

### 5. Avvia il server

```bash
npm run dev
```

Il server parte su `http://localhost:5000`.

---

## Alternative: PostgreSQL via Docker

Se preferisci Docker invece dell'installazione nativa:

```bash
docker run -d \
  --name pg_prenotazioni \
  -e POSTGRES_PASSWORD=YOLO \
  -e POSTGRES_DB=prenotazioni_db \
  -p 5432:5432 \
  postgres:latest

# Poi esegui setup (salta il check PostgreSQL)
npx prisma migrate deploy
npx prisma generate
npm run seed
```

---

## Reset del database

Per ricreare tutto da zero:

```bash
# Elimina e ricrea il DB
dropdb -U postgres prenotazioni_db
createdb -U postgres prenotazioni_db

# Oppure via Docker
docker rm -f pg_prenotazioni
# poi riesegui il container come sopra

# Riapplica migrazioni e seed
npx prisma migrate deploy
npx prisma generate
npm run seed
```

---

## Comandi utili

| Comando | Cosa fa |
|---------|---------|
| `npm run dev` | Avvia il server in modalità sviluppo (hot reload) |
| `npm run build` | Compila TypeScript in JavaScript |
| `npm start` | Avvia il server dalla build compilata |
| `npm run seed` | Popola il DB con dati di test |
| `npx prisma studio` | Apri interfaccia grafica per esplorare i dati |
| `npx prisma migrate deploy` | Applica migrazioni pendenti |
| `npx prisma generate` | Rigenera il client Prisma |
