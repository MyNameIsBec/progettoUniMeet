[TOC]

<br>

<div align="center">
  <img src="pg_frontend/src/assets/icon/unimeet-logo.svg" alt="UniMeet Logo" width="400">
  <br><br>
  <h1>UniMeet — Documentazione del Progetto</h1>
  <h3>Sistema di Prenotazione Ricevimento Studenti</h3>
  <br>
  <p><strong>Corso di Programmazione Web e Mobile</strong></p>
  <p>Anno Accademico 2025/2026</p>
  <br>
</div>

---

# Indice

1. [Introduzione](#1-introduzione)
   - 1.1 [Scopo del Progetto](#11-scopo-del-progetto)
   - 1.2 [Architettura Generale](#12-architettura-generale)
   - 1.3 [Tecnologie Utilizzate](#13-tecnologie-utilizzate)
2. [Modellazione dei Dati](#2-modellazione-dei-dati)
   - 2.1 [Diagramma Entita-Relazione (E-R)](#21-diagramma-entita-relazione-e-r)
   - 2.2 [Schema del Database](#22-schema-del-database)
   - 2.3 [Relazioni tra le Entita](#23-relazioni-tra-le-entita)
   - 2.4 [Migrazioni del Database](#24-migrazioni-del-database)
3. [Backend — API REST](#3-backend--api-rest)
   - 3.1 [Configurazione del Server](#31-configurazione-del-server)
   - 3.2 [Autenticazione e Sicurezza](#32-autenticazione-e-sicurezza)
   - 3.3 [Endpoint API](#33-endpoint-api)
   - 3.4 [Validazione e Middleware](#34-validazione-e-middleware)
   - 3.5 [Servizi Business](#35-servizi-business)
4. [Frontend — Applicazione Mobile/Web](#4-frontend--applicazione-mobileweb)
   - 4.1 [Architettura Angular](#41-architettura-angular)
   - 4.2 [Servizi e Integrazione API](#42-servizi-e-integrazione-api)
   - 4.3 [Pagine e Funzionalita per Ruolo](#43-pagine-e-funzionalita-per-ruolo)
   - 4.4 [Tema e Stili](#44-tema-e-stili)
5. [Funzionalita dell Applicazione](#5-funzionalita-dell-applicazione)
   - 5.1 [Autenticazione e Gestione Account](#51-autenticazione-e-gestione-account)
   - 5.2 [Prenotazione Ricevimenti](#52-prenotazione-ricevimenti)
   - 5.3 [Bacheca e FAQ](#53-bacheca-e-faq)
   - 5.4 [Notifiche](#54-notifiche)
   - 5.5 [Segnalazioni](#55-segnalazioni)
   - 5.6 [Dashboard e Statistiche](#56-dashboard-e-statistiche)
   - 5.7 [Amministrazione](#57-amministrazione)
6. [Test e Verifica](#6-test-e-verifica)
   - 6.1 [Test degli Endpoint API](#61-test-degli-endpoint-api)
   - 6.2 [Compilazione Frontend](#62-compilazione-frontend)
   - 6.3 [Coerenza FE/BE](#63-coerenza-febe)
7. [Guida all Installazione](#7-guida-allinstallazione)
   - 7.1 [Prerequisiti](#71-prerequisiti)
   - 7.2 [Setup Backend](#72-setup-backend)
   - 7.3 [Setup Frontend](#73-setup-frontend)
   - 7.4 [Database Seed](#74-database-seed)
8. [Struttura del Progetto](#8-struttura-del-progetto)
   - 8.1 [Backend — pg_backend/](#81-backend--pg_backend)
   - 8.2 [Frontend — pg_frontend/](#82-frontend--pg_frontend)

---

# 1. Introduzione

## 1.1 Scopo del Progetto

UniMeet e un applicazione web/mobile progettata per semplificare la gestione dei ricevimenti studenti all'interno di un Ateneo. Il sistema consente a tre categorie di utenti (studenti, docenti, amministratori) di interagire per organizzare, prenotare e gestire gli appuntamenti di ricevimento in modo efficiente e digitale.

**Obiettivi principali:**

- Eliminare la gestione cartacea dei ricevimenti
- Fornire un calendario visivo degli slot disponibili per ogni docente
- Permettere prenotazioni con upload di documenti (tesi, progetti, etc.)
- Offrire una bacheca informativa con FAQ per ogni corso di studi
- Gestire notifiche in tempo reale e segnalazioni
- Fornire dashboard statistiche per docenti e amministratori

## 1.2 Architettura Generale

L'applicazione segue un'architettura **client-server** a tre livelli:

```
+-------------------+        +-------------------+        +-------------------+
|                   |        |                   |        |                   |
|   Frontend        |  HTTP  |   Backend         |  SQL   |   Database        |
|   Ionic/Angular   |<----->|   Express/Prisma  |<----->|   PostgreSQL      |
|   (Standalone)    |  REST  |   (Node.js)       |  ORM   |                   |
|                   |        |                   |        |                   |
+-------------------+        +-------------------+        +-------------------+
        |                           |
        |                           |
   Browser/Device              Server (localhost:5000)
   (localhost:8100)             Swagger UI (/api-docs)
```

- **Frontend:** Applicazione Ionic standalone (Angular 19) eseguita nel browser o su dispositivo mobile via Capacitor.
- **Backend:** API REST sviluppata con Express 5 su Node.js 24, con Prisma ORM per l'accesso ai dati.
- **Database:** PostgreSQL con schema relazionale normalizzato (16 entita).

## 1.3 Tecnologie Utilizzate

### Backend
| Tecnologia | Versione | Ruolo |
|------------|----------|-------|
| Node.js | 24.x | Runtime JavaScript |
| Express | 5.x | Framework web REST |
| Prisma | 7.x | ORM e migrazioni database |
| TypeScript | 6.x | Linguaggio di sviluppo |
| PostgreSQL | 16.x | Database relazionale |
| JWT (jsonwebtoken) | 9.x | Autenticazione Bearer token |
| bcrypt | 5.x | Hashing password |
| express-validator | 7.x | Validazione input |
| multer | 2.x | Upload file |
| nodemailer | 6.x | Invio email |
| tsx | 4.x | Esecuzione TypeScript in sviluppo |

### Frontend
| Tecnologia | Versione | Ruolo |
|------------|----------|-------|
| Angular | 19.x | Framework frontend |
| Ionic | 8.x | UI components mobile-first |
| TypeScript | 5.x | Linguaggio |
| Leaflet | 1.x | Mappe interattive |
| RxJS | 7.x | Programmazione reattiva |
| Karma | 6.x | Test runner |
| Capacitor | 6.x | Build nativa mobile |

---

# 2. Modellazione dei Dati

## 2.1 Diagramma Entita-Relazione (E-R)

Il diagramma seguente rappresenta la struttura logica del database, con tutte le 15 entita e le relazioni che governano il sistema UniMeet.

![Diagramma ER UniMeet](er-diagram.png)

**Legenda del diagramma:**
- Ogni rettangolo rappresenta un'entita del database
- Le chiavi primarie sono evidenziate con l'icona chiave in blu
- Le chiavi esterne sono evidenziate con una freccia in rosso
- Le linee continue rappresentano relazioni (1:1, 1:N, M:N)
- Le entita sono raggruppate per dominio funzionale

## 2.2 Schema del Database

Il database e composto da 16 tabelle, organizzate per dominio funzionale:

### Entita Principali

| Tabella | Descrizione | Attributi principali |
|---------|-------------|---------------------|
| **CorsoDiStudi** | Corsi di laurea dell'Ateneo | id_corso_di_studi (PK), nome (UNIQUE) |
| **Studente** | Studenti iscritti | matricola (PK), nome, cognome, email (UNIQUE), password, id_corso_di_studi (FK) |
| **Docente** | Docenti universitari | id_docente (PK), nome, cognome, email (UNIQUE), password, ufficio |
| **Amministratore** | Amministratori di sistema | id_admin (PK), nome, email (UNIQUE), password |
| **DocenteCorsoDiStudi** | Associazione M:N Docente-CorsoDiStudi | id_docente (FK), id_corso_di_studi (FK) — PK composta |

### Entita Didattiche

| Tabella | Descrizione | Attributi principali |
|---------|-------------|---------------------|
| **Corso** | Insegnamento universitario | id_corso (PK), nome_corso, anno, cfu, id_docente (FK), id_corso_di_studi (FK?) |
| **Bacheca** | Bacheca informativa per corso | id_bacheca (PK), titolo, descrizione, data_ultimo_agg., id_corso_di_studi (FK, UNIQUE) |
| **FAQ** | Domande frequenti | id_faq (PK), domanda, risposta, data_pubblicazione, id_bacheca (FK) |

### Entita Ricevimento

| Tabella | Descrizione | Attributi principali |
|---------|-------------|---------------------|
| **SlotRicevimento** | Slot orari disponibili | id_slot (PK), data, ora_inizio, ora_fine, disponibilita, id_docente (FK) |
| **LuogoRicevimento** | Luogo del ricevimento (1:1 con Slot) | id_luogo (PK), nome_aula, edificio, piano, lat/lng, id_slot (FK, UNIQUE) |
| **Prenotazione** | Prenotazione di uno slot | id_prenotazione (PK), data, argomento, descrizione, stato, matricola_studente (FK), id_slot (FK) |
| **Documento** | File allegati alla prenotazione | id_documento (PK), nome_file, tipo, dimensione, percorso, id_prenotazione (FK) |

### Entita di Sistema

| Tabella | Descrizione | Attributi principali |
|---------|-------------|---------------------|
| **Notifica** | Notifiche per utenti | id_notifica (PK), titolo, messaggio, tipo, letta, destinatario_id, destinatario_ruolo |
| **Segnalazione** | Segnalazioni problemi | id_segnalazione (PK), oggetto, descrizione, stato, allegato, matricola_studente (FK?), id_docente (FK?) |
| **GiornoBloccato** | Giorni festivi/bloccati | id_giorno (PK), data (UNIQUE), motivo |
| **CodiceVerifica** | Codici temporanei per reset password | id (PK), email, codice, tipo, scadenza, usato |

## 2.3 Relazioni tra le Entita

### Schema delle Relazioni

| Entita 1 | Relazione | Entita 2 | Descrizione |
|----------|-----------|----------|-------------|
| CorsoDiStudi | 1 → N | Studente | Un corso di studi ha molti studenti iscritti |
| CorsoDiStudi | 1 → N | Corso | Un corso di studi comprende molti insegnamenti |
| CorsoDiStudi | 1 → 1 | Bacheca | Ogni corso di studi ha esattamente una bacheca |
| CorsoDiStudi | M → N | Docente | Un corso ha molti docenti, un docente appartiene a molti corsi (tramite DocenteCorsoDiStudi) |
| Docente | 1 → N | Corso | Un docente insegna molti corsi |
| Docente | 1 → N | SlotRicevimento | Un docente offre molti slot di ricevimento |
| Docente | 1 → N | Segnalazione | Un docente riceve molte segnalazioni |
| SlotRicevimento | 1 → 1 | LuogoRicevimento | Ogni slot si tiene esattamente in un luogo |
| SlotRicevimento | 1 → N | Prenotazione | Uno slot puo avere molte prenotazioni (ma solo una alla volta e confermata) |
| Studente | 1 → N | Prenotazione | Uno studente effettua molte prenotazioni |
| Studente | 1 → N | Segnalazione | Uno studente invia molte segnalazioni |
| Prenotazione | 1 → N | Documento | Una prenotazione puo avere molti documenti allegati |
| Bacheca | 1 → N | FAQ | Una bacheca contiene molte FAQ |

### Vincoli di Integrita

```
- Studente.id_corso_di_studi → CorsoDiStudi.id_corso_di_studi (ON DELETE RESTRICT)
- Prenotazione.matricola_studente → Studente.matricola (ON DELETE RESTRICT)
- Prenotazione.id_slot → SlotRicevimento.id_slot (ON DELETE RESTRICT)
- SlotRicevimento.id_docente → Docente.id_docente (ON DELETE CASCADE)
- Documento.id_prenotazione → Prenotazione.id_prenotazione (ON DELETE CASCADE)
- Bacheca.id_corso_di_studi → CorsoDiStudi.id_corso_di_studi (ON DELETE CASCADE)
- FAQ.id_bacheca → Bacheca.id_bacheca (ON DELETE CASCADE)
- Segnalazione.matricola_studente → Studente.matricola (ON DELETE SET NULL)
- Segnalazione.id_docente → Docente.id_docente (ON DELETE SET NULL)
```

## 2.4 Migrazioni del Database

Il database e stato sviluppato in 5 migrazioni progressive, che riflettono l'evoluzione del modello dati:

### Migrazione 1: `20260504143801_init` — Struttura Iniziale

Creazione delle tabelle fondamentali: Studente, Docente, Amministratore, Corso, Bacheca, FAQ, SlotRicevimento, LuogoRicevimento, Prenotazione, Documento, Notifica. Relazioni 1:N con vincoli referenziali e indici univoci su email.

### Migrazione 2: `20260514182735_add_codice_verifica`

Aggiunta del supporto per reset password: tabella CodiceVerifica con indice composto su (email, tipo). Aggiunte colonne a Notifica (titolo, letta, destinatario_id, destinatario_ruolo). Creazione tabelle Segnalazione e GiornoBloccato.

### Migrazione 3: `20260516143900_add_corso_di_studi_entity`

Refactoring significativo: introduzione dell'entita CorsoDiStudi con tabella ponte DocenteCorsoDiStudi (relazione M:N). Ristrutturazione di Bacheca (da FK verso Corso a FK verso CorsoDiStudi) e Studente (da campo testo corso_di_studi a FK strutturata).

### Migrazione 4: `20260522114559_add_corso_corso_di_studi`

Aggiunta FK opzionale id_corso_di_studi su Corso (ON DELETE SET NULL), permettendo ai corsi di essere associati opzionalmente a un corso di studi.

### Migrazione 5: `20260522122719_add_docente_segnalazioni`

Estensione del modello Segnalazioni: aggiunta FK opzionale id_docente e modifica della FK matricola_studente con ON DELETE SET NULL, permettendo segnalazioni anonime o da parte di docenti.

---

# 3. Backend — API REST

## 3.1 Configurazione del Server

### Entry Point (`server.ts`)

Il server Express viene avviato sulla porta 5000 (configurabile via env PORT). All'avvio:

1. Carica le variabili d'ambiente da `.env`
2. Inizializza la connessione Prisma al database PostgreSQL
3. Monta tutti i middleware globali (CORS, JSON, URL-encoded, static files)
4. Registra tutte le route sotto il prefisso `/api`
5. Espone la documentazione Swagger UI su `/api-docs`
6. Avvia il server in ascolto

```typescript
// Schema di avvio (server.ts)
import dotenv/config;
import app from './app';
import prisma from './prisma';

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await prisma.$connect();
  console.log(`Server running on port ${PORT}`);
});
```

### Variabili d'Ambiente (`.env`)

| Variabile | Valore | Descrizione |
|-----------|--------|-------------|
| DATABASE_URL | postgresql://... | URL connessione PostgreSQL |
| PORT | 5000 | Porta del server |
| JWT_SECRET | (chiave) | Segreto per firma JWT |
| JWT_EXPIRES_IN | 24h | Scadenza token |
| JWT_REFRESH_EXPIRES_IN | 7d | Scadenza refresh token |
| SMTP_HOST/OAuth2 | (config) | Server email per reset password |

## 3.2 Autenticazione e Sicurezza

### Schema di Autenticazione

UniMeet utilizza **JWT (JSON Web Token)** per l'autenticazione stateless:

```
1. Login → POST /api/login
   → Body: { email, password }
   → Response: { token, user: { id, nome, cognome, email, ruolo } }

2. Richieste autenticate → Header: Authorization: Bearer <token>
   
3. Il middleware authenticate.ts:
   - Estrae il token dall'header Authorization
   - Verifica la firma con JWT_SECRET
   - Decodifica il payload { id, ruolo }
   - Allega user alla richiesta (req.user)
```

### Middleware di Autorizzazione

```
authenticate.ts      → Verifica JWT, estrae user (id + ruolo)
authorize.ts         → Factory: authorize('studente', 'docente', 'amministratore')
                       Controlla che req.user.ruolo sia tra i ruoli consentiti
```

**Esempio di protezione route:**
```typescript
router.get('/admin/stats',
  authenticate,
  authorize('amministratore'),
  adminController.getStatistiche
);
```

### Gestione Password

- Hashing con **bcrypt** (salt rounds: 10)
- Validazione lunghezza minima 8 caratteri
- Reset password tramite **codice di verifica** (6 cifre, scadenza 15 minuti)
- Email inviata via nodemailer (SMTP configurabile)

## 3.3 Endpoint API

L'API espone **67 endpoint** organizzati in 9 sezioni. Documentazione Swagger disponibile su `/api-docs`.

### Tabella Riepilogativa Endpoint

| Metodo | Percorso | Descrizione | Autenticazione |
|--------|----------|-------------|----------------|
| **Auth** | | | |
| POST | `/api/login` | Login utente | Pubblico |
| POST | `/api/registrazione` | Registrazione studente | Pubblico |
| POST | `/api/recupera-password` | Richiedi reset password | Pubblico |
| POST | `/api/reset-password` | Reset con codice | Pubblico |
| GET | `/api/auth/profile` | Profilo utente corrente | JWT |
| POST | `/api/auth/change-password` | Cambio password | JWT |
| **Studenti** | | | |
| GET | `/api/studenti/:id` | Profilo studente | JWT (studente/docente/admin) |
| PUT | `/api/studenti/:id` | Modifica profilo | JWT (studente) |
| DELETE | `/api/studenti/:id` | Elimina account | JWT (studente) |
| **Docenti** | | | |
| GET | `/api/docenti` | Lista docenti | JWT |
| GET | `/api/docenti/:id` | Dettagli docente | JWT |
| GET | `/api/docenti/:id/slots` | Slot del docente | JWT |
| **Prenotazioni** | | | |
| GET | `/api/prenotazioni/studente/:matricola` | Prenotazioni studente | JWT |
| GET | `/api/prenotazioni/docente/:id` | Prenotazioni docente | JWT |
| GET | `/api/prenotazioni/:id` | Dettaglio prenotazione | JWT |
| POST | `/api/prenotazioni` | Crea prenotazione (FormData) | JWT (studente) |
| PUT | `/api/prenotazioni/:id/stato` | Aggiorna stato | JWT (docente/admin) |
| DELETE | `/api/prenotazioni/:id` | Elimina | JWT (ruolo autorizzato) |
| **Bacheche** | | | |
| GET | `/api/bacheche/corso-di-studi/:idCorsoDiStudi` | Bacheca per corso | JWT |
| GET | `/api/bacheche/corso-di-studi/:idCorsoDiStudi/faq` | FAQ associate | JWT |
| POST | `/api/bacheche/:idBacheca/faq` | Crea FAQ | JWT (docente) |
| PUT | `/api/faq/:id` | Modifica FAQ | JWT (docente) |
| DELETE | `/api/faq/:id` | Elimina FAQ | JWT (docente) |
| **Notifiche** | | | |
| GET | `/api/notifiche/:destinatarioId` | Notifiche utente | JWT |
| PUT | `/api/notifiche/:id/letta` | Segna come letta | JWT |
| PUT | `/api/notifiche/letta/:destinatarioId` | Segna tutte lette | JWT |
| DELETE | `/api/notifiche/lette/:destinatarioId` | Cancella lette | JWT |
| **Segnalazioni** | | | |
| POST | `/api/segnalazioni` | Crea segnalazione (FormData) | JWT |
| GET | `/api/segnalazioni` | Tutte (admin) | JWT (admin) |
| GET | `/api/segnalazioni/studente/:matricola` | Segnalazioni studente | JWT |
| GET | `/api/segnalazioni/docente/:id` | Segnalazioni docente | JWT |
| PUT | `/api/segnalazioni/:id/stato` | Aggiorna stato | JWT (admin) |
| DELETE | `/api/segnalazioni/:id` | Elimina | JWT (admin) |
| **Admin** | | | |
| GET | `/api/admin/stats` | Statistiche dashboard | JWT (admin) |
| GET | `/api/admin/utenti` | Lista utenti | JWT (admin) |
| POST | `/api/admin/utenti` | Crea utente | JWT (admin) |
| PUT | `/api/admin/utenti/:id` | Modifica utente | JWT (admin) |
| DELETE | `/api/admin/utenti/:id` | Elimina utente | JWT (admin) |
| GET | `/api/admin/prenotazioni` | Prenotazioni (filtrate) | JWT (admin) |
| PUT | `/api/admin/prenotazioni/:id/stato` | Aggiorna stato | JWT (admin) |
| DELETE | `/api/admin/prenotazioni/:id` | Elimina | JWT (admin) |
| GET | `/api/admin/slot` | Slot globali | JWT (admin) |
| POST | `/api/admin/slot` | Crea slot | JWT (admin) |
| PUT | `/api/admin/slot/:id` | Modifica slot | JWT (admin) |
| DELETE | `/api/admin/slot/:id` | Elimina slot | JWT (admin) |
| GET | `/api/admin/slot/date` | Date con slot | JWT (admin) |
| GET | `/api/admin/giorni-bloccati` | Giorni bloccati | JWT (admin) |
| POST | `/api/admin/giorni-bloccati` | Blocca giorno | JWT (admin) |
| DELETE | `/api/admin/giorni-bloccati/:id` | Sblocca giorno | JWT (admin) |

## 3.4 Validazione e Middleware

### Validatori (express-validator)

Ogni endpoint dispone di validatori specifici che controllano:

- **Esistenza campi obbligatori** → `body('email').isEmail().withMessage('Email non valida')`
- **Tipi di dati** → `body('matricola').isString().notEmpty()`
- **Lunghezze minime** → `body('password').isLength({ min: 8 })`
- **Enum e valori consentiti** → `body('ruolo').isIn(['studente', 'docente', 'amministratore'])`
- **Validazione parametri URL** → `param('id').isUUID()`

### Upload Files (multer)

```
Configurazione multer:
- Storage: disk (upload/, con filename univoco timestamp-originale)
- Dimensioni max: 10 MB
- Estensioni consentite: .pdf, .doc, .docx, .jpg, .jpeg, .png, .zip
```

## 3.5 Servizi Business

Il backend implementa 11 servizi che incapsulano la logica di business:

| Servizio | Responsabilita principali |
|----------|--------------------------|
| **AuthService** | Login (bcrypt verify + JWT sign), registrazione, cambio/reset password |
| **StudentiService** | CRUD profilo studente, eliminazione account |
| **DocentiService** | Elenco docenti, dettagli, slot per docente |
| **PrenotazioniService** | CRUD prenotazioni, cambio stato, gestione documenti |
| **BachecaService** | CRUD bacheca per corso, CRUD FAQ |
| **NotificheService** | Invio notifiche, segna letta, cancellazione |
| **SegnalazioniService** | CRUD segnalazioni, upload allegati |
| **AdminService** | CRUD utenti (multi-ruolo), gestione slot/calendario |
| **StatisticheService** | Conteggi e aggregazioni per dashboard |
| **EmailService** | Invio email con nodemailer (reset password) |
| **CorsiService** | Placeholder per espansione futura |

---

# 4. Frontend — Applicazione Mobile/Web

## 4.1 Architettura Angular

L'applicazione frontend e sviluppata con **Ionic 8 + Angular 19** in modalita **standalone** (senza NgModule).

### Pattern Architetturale

```
src/
  app/
    core/                    ← Servizi, modelli, guardie, interceptor
      guards/                 Protezione rotte (auth, ruolo)
      interceptors/           HTTP interceptors (JWT, errori)
      models/                 Interfacce TypeScript
      services/               12 servizi API
      validators/             Validatori personalizzati
    components/               Componenti condivisi (sidebar, topbar, layout)
    features/                 Pagine raggruppate per ruolo
      auth/                   Login, registrazione, reset password
      home/                   Landing page pubblica
      studente/               9 pagine
      docente/                10 pagine
      admin/                  6 pagine
```

### Routing (27 route)

Le route sono protette da due guardie:

```
authGuard       → Verifica presenza token JWT valido
roleGuard(X)    → Verifica che l'utente abbia ruolo X
```

**Esempio:**
```typescript
{
  path: 'dashboard-studente',
  canActivate: [authGuard, roleGuard('studente')],
  loadComponent: () => import('./features/studente/...').then(m => m.DashboardStudentePage)
}
```

### Flusso di Autenticazione

```
┌──────────┐     ┌──────────────┐     ┌───────────┐
│  Login   │────>│  auth.service│────>│   API     │
│  Page    │     │  .login()    │     │  /login   │
└──────────┘     └──────┬───────┘     └───────────┘
                        │
                        ▼
                   localStorage           ┌──────────────┐
                   setItem('token', ...)──>│  auth        │
                                          │  interceptor │
                                          │  (aggiunge   │
                                          │  Bearer)     │
                                          └──────────────┘
```

## 4.2 Servizi e Integrazione API

I 12 servizi frontend utilizzano `HttpClient` di Angular per comunicare con il backend:

| Servizio | Endpoint API | Metodi |
|----------|-------------|--------|
| **auth.service.ts** | `/api/login`, `/api/registrazione`, `/api/recupera-password`, `/api/reset-password`, `/api/auth/profile`, `/api/auth/change-password` | login(), registrazione(), recuperaPassword(), resetPassword(), getCurrentUser(), cambiaPassword(), logout() |
| **prenotazione.service.ts** | `/api/prenotazioni/*` | getPrenotazioniStudente(), getPrenotazioniDocente(), createPrenotazione(formData), confermaPrenotazione(), annullaPrenotazione() |
| **studente.service.ts** | `/api/studenti/*` | getProfilo(), aggiornaProfilo(), eliminaAccount() |
| **docente.service.ts** | `/api/docenti/*` | getDocenti(), getDocentiPerCorso(), getDettagliDocente(), getSlots() |
| **admin.service.ts** | `/api/admin/*` | getStatistiche(), CRUD utenti, CRUD prenotazioni, CRUD slot, CRUD giorni bloccati |
| **bacheca.service.ts** | `/api/bacheche/*`, `/api/faq/*` | getBachecaPerCorsoDiStudi(), getFaq(), aggiungiFaq(), modificaFaq(), eliminaFaq() |
| **segnalazione.service.ts** | `/api/segnalazioni/*` | getAllSegnalazioni(), getSegnalazioniStudente(), creaSegnalazione(formData), aggiornaStato() |
| **notifica.service.ts** | `/api/notifiche/*` | getNotifiche(), segnaComeLetta(), segnaTutteComeLette(), cancellaNotificheLette() |
| **statistiche.service.ts** | `/api/admin/stats`, `/api/prenotazioni/docente/:id` | getStatisticheDocente(), getStatisticheAdmin() |
| **pdf.service.ts** | — (client-side) | exportAgendaPDF(), exportListaPDF() — genera PDF con libreria lato client |
| **errori.service.ts** | — (client-side) | getMessaggioErrore() — traduzione errori HTTP in messaggi user-friendly |

## 4.3 Pagine e Funzionalita per Ruolo

### Pagine Pubbliche (4 pagine)

| Pagina | Percorso | Funzionalita |
|--------|----------|--------------|
| **HomePage** | `/home` | Landing page con hero, features (3 card: Prenotazioni, Bacheca, Segnalazioni), statistiche, CTA. Se autenticato, reindirizza alla dashboard del ruolo. |
| **LoginPage** | `/login` | Form email/password, Remember me, mostra/nascondi password, link a registrazione e recupero password, segnalazione rapida |
| **RegistrazionePage** | `/registrazione` | Form nome, cognome, email, password (x2), selezione corso di studi, validazione lato client |
| **RecuperaPasswordPage** | `/recupera-password` | Inserimento email, invio codice verifica |
| **ResetPasswordPage** | `/reset-password` | Inserimento email + codice + nuova password + conferma |

### Pagine Studente (9 pagine)

| Pagina | Funzionalita |
|--------|-------------|
| **DashboardStudentePage** | Bentornato con nome, riepilogo prenotazioni future, prossimo ricevimento, FAQ rapide, stato prenotazioni |
| **ElencoDocentiPage** | Griglia docenti con avatar, nome, materia, email, info, filtro per ricerca testuale |
| **PrenotaPage** | Calendario settimanale interattivo (9:00-18:00), selezione docente, navigazione settimane, form prenotazione con upload documenti (argomento, note, file), modale conferma, gestione file multipli |
| **RiepilogoPrenotazioniPage** | Lista cronologica prenotazioni, filtri per stato (tutte/in attesa/confermate/annullate), ricerca testuale, badge colore per stato, elimina con conferma |
| **DettaglioPrenotazionePage** | Info complete ricevimento, mappa Leaflet interattiva con geolocalizzazione utente e marker aula, documenti allegati, stato prenotazione, azioni (annulla), GPS tracking |
| **BachecaStudentePage** | FAQ accordion con domanda/risposta, link utili (sito Unipa, Portale Studenti), card di supporto |
| **SegnalazioniStudentePage** | Form segnalazione (oggetto, descrizione, allegato max 5MB), storico con stato colorato (APERTA/IN_LAVORAZIONE/RISOLTA), statistiche personali |
| **NotificheStudentePage** | Lista notifiche con icone contestuali (promemoria, aggiornamento, sistema), filtri (tutte/non lette/promemoria/aggiornamenti), segna tutte lette, cancella lette, badge contatori |
| **ProfiloStudentePage** | Modifica profilo (nome, cognome, email, corso), cambio password, preferenze (dark mode, notifiche, reminder), eliminazione account con conferma |

### Pagine Docente (10 pagine)

| Pagina | Funzionalita |
|--------|-------------|
| **DashboardDocentePage** | Statistiche riepilogo (prenotazioni oggi, slot disponibili, richieste in attesa, media riempimento), prossimi ricevimenti, argomenti popolari, prenotazioni recenti |
| **PrenotazioniRicevutePage** | Lista prenotazioni ricevute, filtri (stato: tutte/attesa/confermate/annullate, periodo: oggi/settimana/mese/tutti), ricerca, conferma multipla, scarica agenda PDF |
| **GestioneSlotPage** | Calendario slot propri, creazione/modifica/eliminazione slot (data, ora inizio/fine, aula, edificio, piano), filtri per stato/mese, statistiche slot |
| **BachecheDocentePage** | Selezione corso di studi da menu a tendina, visualizzazione bacheca e FAQ, CRUD FAQ tramite modale alert (aggiungi/modifica/elimina) |
| **SegnalazioniDocentePage** | Form invio segnalazione, storico, statistiche — simile alla versione studente |
| **NotificheDocentePage** | Come notifiche studente, filtrate per id docente |
| **DocumentiDocentePage** | Archivio documenti caricati dagli studenti nelle prenotazioni, raggruppati per prenotazione, filtro, anteprima tramite icona file, apertura diretta |
| **StatisticheDocentePage** | Percentuali stato prenotazioni (confermate/in attesa/annullate), distribuzione argomenti |
| **ProfiloDocentePage** | Modifica dati personali (nome, cognome, email, ufficio), cambio password, preferenze notifiche |
| **DettaglioPrenotazioneDocentePage** | Dettaglio prenotazione con gestione documenti (upload nuovi, rimuovi), azioni (conferma/annulla), note, stato |

### Pagine Admin (6 pagine)

| Pagina | Funzionalita |
|--------|-------------|
| **DashboardAdminPage** | Statistiche di sistema: totale studenti, docenti, prenotazioni totali, slot attivi, prenotazioni oggi |
| **GestioneUtentiAdminPage** | CRUD completo utenti (studenti, docenti, amministratori): crea con form, modifica, elimina, filtro per ruolo, ricerca |
| **GestionePrenotazioniAdminPage** | Panoramica globale prenotazioni con filtri per stato, modifica stato direttamente, elimina, dettaglio informativo |
| **GestioneSegnalazioniAdminPage** | Gestione segnalazioni: modifica stato (APERTA/IN_LAVORAZIONE/RISOLTA), elimina, dettaglio con info utente, visualizzazione allegato |
| **GestioneSlotAdminPage** | CRUD slot globali per qualsiasi docente, scelta docente tramite modale, filtri per docente/stato/mese |
| **GestioneCalendarioAdminPage** | Gestione giorni bloccati (festivi, chiusure): blocca data con motivo, sblocca, lista cronologica |

## 4.4 Tema e Stili

L'applicazione supporta **tema chiaro/scuro** con variabili CSS Ionic personalizzate.

### Tema Chiaro (default)
```
Colori primari:  #2563eb (blu), #1d4ed8 (blu scuro)
Sfondi:          #f8fafc (grigio chiarissimo), #ffffff (bianco)
Testo:           #1e293b (grigio scuro), #64748b (grigio medio)
Card:            sfondo bianco, border-radius 28px, ombra leggera
```

### Tema Scuro
```
Sfondi:          #0f172a (blu notte), #1e293b (grigio scuro)
Testo:           #f1f5f9 (bianco sporco)
Card:            sfondo #1e293b con bordo #334155
Accenti:         ciano/azzurro per contrasto
```

### Componenti Condivisi

- **SidebarComponent** — Navigazione laterale con icone Ionic, highlight route attiva, adattamento per mobile
- **TopbarComponent** — Barra superiore con badge notifiche non lette, toggle tema chiaro/scuro, logout
- **DashboardLayoutComponent** — Layout wrapper che combina Sidebar + Topbar + contenuto `ng-content`

---

# 5. Funzionalita dell Applicazione

## 5.1 Autenticazione e Gestione Account

### Flusso di Login
```
1. Utente inserisce email + password
2. Frontend invia POST /api/login
3. Backend verifica credenziali (bcrypt.compare)
4. Se valide: genera JWT { id, ruolo } con validita 24h
5. Frontend salva token in localStorage
6. auth.interceptor.ts aggiunge Authorization: Bearer a ogni richiesta
7. currentUser$ BehaviorSubject aggiornato (tutta l'app reagisce)
8. Reindirizzamento alla dashboard del ruolo
```

### Registrazione Nuovo Studente
```
1. Form con nome, cognome, email, password (x2), corso di studi
2. Validazione lato client: password >= 8 char, corrispondenza, email format
3. Validazione lato server: email unica, campi obbligatori
4. Backend: crea record Studente, genera JWT
5. Response: token + dati utente
6. Reindirizzamento a dashboard studente
```

### Recupero Password
```
1. Utente inserisce email in /recupera-password
2. Backend genera codice 6 cifre, salva in CodiceVerifica (scadenza 15 min)
3. EmailService invia email con nodemailer (se SMTP configurato)
4. Utente inserisce codice + nuova password in /reset-password
5. Backend verifica codice, hash nuova password, aggiorna record
```

## 5.2 Prenotazione Ricevimento

### Flusso Completo di Prenotazione

```
┌─────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐
│ Studente │    │ Frontend  │    │  Backend   │    │ Database │
└────┬────┘    └─────┬────┘    └─────┬─────┘    └────┬─────┘
     │                │                │               │
     │ 1. Seleziona   │                │               │
     │    docente     │                │               │
     │───────────────>│                │               │
     │                │ 2. GET         │               │
     │                │   /docenti     │               │
     │                │───────────────>│               │
     │                │<───────────────│               │
     │ 3. Seleziona   │    lista       │               │
     │    slot        │                │               │
     │───────────────>│ 4. GET         │               │
     │                │   /docenti     │               │
     │                │   /:id/slots   │               │
     │                │───────────────>│──────────────>│
     │                │<───────────────│<──────────────│
     │ 5. Compila     │   slot liberi  │               │
     │    form + file │                │               │
     │───────────────>│ 6. POST        │               │
     │                │   /prenotazioni│               │
     │                │   (FormData)   │               │
     │                │───────────────>│──────────────>│
     │                │                │ 7. Crea       │
     │                │                │    notifica   │
     │                │<───────────────│<──────────────│
     │                │   201 CREATED  │               │
     │   Conferma     │                │               │
     │<───────────────│                │               │
```

### Dettaglio del Form di Prenotazione
- **Selezione docente:** menu a tendina popolato dall'API
- **Calendario settimanale:** griglia visiva 9:00-18:00 con slot prenotabili
- **Navigazione:** settimana corrente con frecce avanti/indietro
- **Giorni bloccati:** disabilitati automaticamente (festivi, chiusure)
- **Upload documenti:** selettore file, anteprima nomi, rimozione, max 10MB
- **Modale conferma:** dettaglio riepilogo prima dell'invio

## 5.3 Bacheca e FAQ

Ogni **CorsoDiStudi** dispone di una **Bacheca** informativa con **FAQ** gestibili dal docente.

- **Studente:** visualizza FAQ in formato accordion (domanda cliccabile → risposta espandibile), link utili esterni (sito Unipa, Portale Studenti)
- **Docente:** CRUD completo FAQ tramite interfaccia dedicata, seleziona il corso di studi, aggiunge/modifica/elimina domande e risposte

## 5.4 Notifiche

Sistema di notifiche multi-tipo:

| Tipo | Descrizione | Icona |
|------|-------------|-------|
| **promemoria** | Promemoria prenotazione imminente | campanella |
| **aggiornamento** | Stato prenotazione cambiato (conferma/annullamento) | aggiornamento |
| **sistema** | Comunicazioni di sistema | ingranaggio |

**Funzionalita:**
- Badge contatore notifiche non lette nella Topbar
- Filtri: tutte / non lette / per tipo
- Segna tutte come lette (batch update)
- Cancella notifiche lette
- Colori distinti per tipo (giallo promemoria, blu aggiornamento, grigio sistema)
- Link diretto alla risorsa correlata (es. dettaglio prenotazione)

## 5.5 Segnalazioni

Sistema di segnalazione problemi interno all'app:

- **Studente/Docente:** inviano segnalazioni con oggetto, descrizione, allegato (max 5MB)
- **Admin:** gestisce lo stato (APERTA → IN_LAVORAZIONE → RISOLTA), visualizza allegati
- Tracciamento storico con statistiche personali per utente

## 5.6 Dashboard e Statistiche

### Dashboard Studente
- Saluto personalizzato "Bentornato/a {nome}"
- Riepilogo prenotazioni future (conteggio)
- Prossimo ricevimento con docente, data, ora, luogo
- FAQ rapide dalla bacheca del corso

### Dashboard Docente
- **Prenotazioni oggi:** conteggio e lista
- **Slot disponibili:** numero slot liberi
- **Richieste in attesa:** prenotazioni da confermare
- **Media riempimento:** percentuale slot occupati
- **Argomenti popolari:** classifica argomenti piu richiesti
- **Prenotazioni recenti:** ultime 5 prenotazioni con link diretto

### Dashboard Admin
- Totale studenti, docenti, prenotazioni, slot attivi
- Prenotazioni del giorno corrente

## 5.7 Amministrazione

L'admin ha accesso completo a tutte le funzionalita di gestione:

### Gestione Utenti
- CRUD per studenti, docenti e amministratori
- Filtro per ruolo con search testuale
- Form modale per creazione/modifica

### Gestione Prenotazioni Globali
- Panoramica di tutte le prenotazioni del sistema
- Filtri per stato
- Modifica stato, eliminazione

### Gestione Slot Globali
- CRUD slot per qualsiasi docente
- Scelta docente tramite modale di selezione
- Filtri per docente, stato, mese

### Gestione Segnalazioni
- Flusso completo APERTA → IN_LAVORAZIONE → RISOLTA
- Dettaglio con info segnalatore e allegato

### Gestione Calendario
- Blocco/sblocco giorni festivi o chiusure straordinarie
- Impossibilita di prenotare in giorni bloccati

---

# 6. Test e Verifica

## 6.1 Test degli Endpoint API

Tutti i 27 endpoint principali sono stati testati con Invoke-WebRequest (PowerShell) e restituiscono **200 OK**:

| Gruppo | Endpoint | Esito |
|--------|----------|-------|
| Auth | `POST /api/login` (studente, docente, admin) | ✅ 200 |
| Auth | `GET /api/auth/profile` | ✅ 200 |
| Auth | `POST /api/registrazione` | ✅ 201 |
| Auth | `POST /api/auth/change-password` | ✅ 200 |
| Auth | `POST /api/recupera-password` | ✅ 200 |
| Studenti | `GET /api/studenti/:matricola` | ✅ 200 |
| Docenti | `GET /api/docenti` | ✅ 200 |
| Docenti | `GET /api/docenti/:id/slots` | ✅ 200 |
| Prenotazioni | `GET /api/prenotazioni/studente/:matricola` | ✅ 200 |
| Prenotazioni | `GET /api/prenotazioni/docente/:id` | ✅ 200 |
| Bacheche | `GET /api/bacheche/corso-di-studi/:idCorsoDiStudi` | ✅ 200 |
| Bacheche | `GET /api/bacheche/corso-di-studi/:idCorsoDiStudi/faq` | ✅ 200 |
| Notifiche | `GET /api/notifiche/:destinatarioId` | ✅ 200 |
| Admin | `GET /api/admin/stats` | ✅ 200 |
| Admin | `GET /api/admin/utenti` | ✅ 200 |
| Admin | `GET /api/admin/prenotazioni?stato=IN_ATTESA` | ✅ 200 |
| Admin | `GET /api/admin/slot` | ✅ 200 |
| Admin | `GET /api/admin/giorni-bloccati` | ✅ 200 |

**Risultato: 10/10 gruppi funzionanti, 27/27 endpoint rispondono correttamente.**

## 6.2 Compilazione Frontend

Il frontend e stato compilato con `ng build`:

```
✔ Building... (34.8 secondi)
✔ Application bundle generation complete.
Output location: pg_frontend/www/

0 errori
23 warnings (import non usati, budget SCSS 400 byte, leaflet CommonJS)
```

**Nessun errore TypeScript**, solo warning cosmetici che non influenzano il funzionamento.

## 6.3 Coerenza FE/BE

La verifica incrociata tra frontend e backend ha confermato la piena coerenza:

| Servizio FE | Chiama | Endpoint BE | Esito |
|-------------|--------|-------------|-------|
| `auth.service.ts` | `POST /api/login` | `router.post('/login')` → `/api/login` | ✅ |
| `bacheca.service.ts` | `GET /api/bacheche/corso-di-studi/:id` | `router.get('/bacheche/corso-di-studi/:idCorsoDiStudi')` → `/api/bacheche/...` | ✅ |
| `notifica.service.ts` | `GET /api/notifiche/:destinatarioId` | `router.get('/notifiche/:destinatarioId')` → `/api/notifiche/...` | ✅ |
| `segnalazione.service.ts` | `POST /api/segnalazioni` con FormData | Valida `matricola_studente`, `upload.single('allegato')` | ✅ |
| `admin.service.ts` | `GET /api/admin/stats` | `router.get('/stats')` → `/api/admin/stats` | ✅ |
| `prenotazione.service.ts` | `POST /api/prenotazioni` con FormData | `upload.single('documento')`, multipart/form-data | ✅ |

---

# 7. Guida all Installazione

## 7.1 Prerequisiti

- Node.js >= 20.x
- PostgreSQL >= 15.x
- npm >= 10.x

## 7.2 Setup Backend

```bash
# 1. Entrare nella cartella backend
cd pg_backend

# 2. Installare le dipendenze
npm install

# 3. Configurare le variabili d'ambiente
cp .env.example .env  # Modificare DATABASE_URL, JWT_SECRET, SMTP

# 4. Eseguire le migrazioni del database
npx prisma migrate deploy

# 5. Avviare il server in sviluppo
npm run dev
# oppure: npx tsx src/server.ts
```

Il server sara disponibile su `http://localhost:5000`.
Documentazione Swagger: `http://localhost:5000/api-docs`.

## 7.3 Setup Frontend

```bash
# 1. Entrare nella cartella frontend
cd pg_frontend

# 2. Installare le dipendenze
npm install

# 3. Avviare il server di sviluppo
npm run dev
# oppure: npx ionic serve
```

L'applicazione sara disponibile su `http://localhost:8100`.

## 7.4 Database Seed

```bash
cd pg_backend
npx tsx prisma/seed.ts
```

Il seed popola il database con:
- **3 Corsi di Studi:** Informatica, Ingegneria Informatica, Matematica
- **5 Studenti:** Mario Rossi, Laura Bianchi, Giuseppe Ferrara, Anna Marino, Francesco Gallo
- **5 Docenti:** Giuseppe Verdi, Maria Romano, Antonio Conti, Elena Sartori, Roberto Bianchi
- **2 Amministratori:** admin@unime.it, superadmin@unime.it
- **8 FAQ:** organizzate per corso di studi
- **5 Slot Ricevimento:** distribuiti tra i docenti
- **5 Prenotazioni:** in vari stati (IN_ATTESA, CONFERMATA, ANNULLATA)
- **3 Giorni Bloccati:** 25/04 (Festa Liberazione), 01/05 (Festa Lavoro), 02/06 (Festa Repubblica)

**Password comune per tutti gli utenti seed:** `password123`

---

# 8. Struttura del Progetto

## 8.1 Backend — `pg_backend/`

```
pg_backend/
  src/
    server.ts                       # Entry point, avvio server Express su porta 5000
    app.ts                          # Configurazione Express, middleware globali, route mounting, Swagger
    controllers/                    # 9 controller: logica di gestione richieste HTTP
      admin.controller.ts           #   Statistiche, CRUD utenti/prenotazioni/slot/giorni bloccati
      auth.controller.ts            #   Login, registrazione, recupero/reset/cambio password
      bacheca.controller.ts         #   CRUD bacheca per corso, CRUD FAQ
      corsi.controller.ts           #   Placeholder (vuoto, predisposto per estensione)
      docenti.controller.ts         #   Lista docenti, dettagli, slot per docente
      notifiche.controller.ts       #   Lista notifiche, segna letta, cancella lette
      prenotazioni.controller.ts    #   CRUD prenotazioni, upload documenti, cambio stato
      segnalazioni.controller.ts    #   CRUD segnalazioni, upload allegati, cambio stato
      studenti.controller.ts        #   Profilo studente, modifica, elimina account
    routes/                         # 9 router: definizione endpoint e middleware
      admin.routes.ts               #   /api/admin/* (authenticate + authorize admin)
      auth.routes.ts                #   /api/auth/* (pubbliche: login, registrazione) + protette (profile, change-password)
      bacheca.routes.ts             #   /api/bacheche/*, /api/faq/* (authenticate)
      corsi.routes.ts               #   /api/corsi/* (vuoto)
      docenti.routes.ts             #   /api/docenti/* (authenticate)
      notifiche.routes.ts           #   /api/notifiche/* (authenticate)
      prenotazioni.routes.ts        #   /api/prenotazioni/* (authenticate, upload documento)
      segnalazioni.routes.ts        #   /api/segnalazioni/* (authenticate, upload allegato)
      studenti.routes.ts            #   /api/studenti/* (authenticate)
    services/                       # 11 service: logica di business
      admin.service.ts              #   Operazioni amministrative
      auth.service.ts               #   Autenticazione, JWT, hashing password
      bacheca.service.ts            #   CRUD bacheca e FAQ
      corsi.service.ts              #   Placeholder
      docenti.service.ts            #   Query docenti e slot
      email.service.ts              #   Invio email (nodemailer)
      notifiche.service.ts          #   Creazione e gestione notifiche
      prenotazioni.service.ts       #   CRUD prenotazioni e documenti
      segnalazioni.service.ts       #   CRUD segnalazioni
      statistiche.service.ts        #   Conteggi e aggregazioni
      studenti.service.ts           #   CRUD profilo studente
    middleware/                      # Middleware Express
      authenticate.ts               #   Verifica JWT Bearer token
      authorize.ts                  #   Factory per controllo ruoli
      upload.ts                     #   Multer disk storage (max 10MB, estensioni consentite)
    validators/                     # 9 file: validazione input con express-validator
      admin.validators.ts           #   Validazione CRUD admin
      auth.validators.ts            #   Validazione login/registrazione/password
      bacheca.validators.ts         #   Validazione bacheca/FAQ
      corsi.validators.ts           #   Placeholder
      docenti.validators.ts         #   Validazione parametri docente
      notifiche.validators.ts       #   Validazione notifiche
      prenotazioni.validators.ts    #   Validazione prenotazioni
      segnalazioni.validators.ts    #   Validazione segnalazioni
      studenti.validators.ts        #   Validazione studenti
    utils/
      time.ts                       # Utility fuso orario Europa/Roma
  prisma/
    schema.prisma                   # Schema database (16 modelli, relazioni, indici)
    seed.ts                         # Dati di test per sviluppo
    migrations/                     # 5 migrazioni SQL progressive
  swagger.yaml                      # Documentazione OpenAPI 3.0 (67 endpoint, 9 tag)
  upload/                           # Cartella upload file (gitignored, creata a runtime)
  package.json                      # Dipendenze e script
  tsconfig.json                     # Configurazione TypeScript
  .env                              # Variabili d'ambiente (gitignored)
  .gitignore                        # Esclusioni git
```

## 8.2 Frontend — `pg_frontend/`

```
pg_frontend/
  src/
    main.ts                         # Bootstrap Angular, registrazione icone globali Ionicons
    global.scss                     # Stili globali (tema, reset, layout, responsive, dark mode)
    index.html                      # Entry point HTML
    theme/
      variables.scss                # Variabili tema Ionic personalizzate
    app/
      app.component.ts              # Component root (IonApp + IonRouterOutlet)
      app.routes.ts                 # 27 route lazy-loaded con guardie (authGuard + roleGuard)
      core/
        models/
          interfacce.ts             # Interfacce TypeScript: Utente, Studente, Docente, Prenotazione,
                                     # SlotRicevimento, LuogoRicevimento, FAQ, Bacheca, Notifica,
                                     # Segnalazione, GiornoBloccato, Corso, Documento, Messaggio
        services/                   # 12 servizi HTTP
          auth.service.ts           #   Login, registrazione, recupero password, cambio password, logout
          prenotazione.service.ts   #   CRUD prenotazioni, cambio stato
          studente.service.ts       #   Profilo studente
          docente.service.ts        #   Docenti e slot
          admin.service.ts          #   Admin CRUD utenti/prenotazioni/slot/calendario
          bacheca.service.ts        #   Bacheca e FAQ
          segnalazione.service.ts   #   Segnalazioni con upload
          notifica.service.ts       #   Notifiche
          statistiche.service.ts    #   Statistiche docenti/admin
          pdf.service.ts            #   Generazione PDF agenda
          errori.service.ts         #   Traduzione errori HTTP
          corsi.service.ts          #   Corsi di studi
        guards/
          auth.guard.ts             #   Verifica autenticazione JWT
          role.guard.ts             #   Verifica ruolo (factory: studente/docente/amministratore)
        interceptors/
          auth.interceptor.ts       #   Aggiunge header Authorization: Bearer
          error.interceptor.ts      #   Gestione errori HTTP (401→login, 403, 500)
        validators/
          custom-validators.ts      #   Validatori personalizzati (password match, email)
      components/                   # Componenti condivisi
        dashboard-layout/           #   Layout dashboard (sidebar + topbar + content)
          dashboard-layout.component.ts
          dashboard-layout.component.html
          dashboard-layout.component.scss
        sidebar/                    #   Navigazione laterale per ruolo
          sidebar.component.ts
          sidebar.component.html
          sidebar.component.scss
        topbar/                     #   Barra superiore con badge notifiche e toggle tema
          topbar.component.ts
          topbar.component.html
          topbar.component.scss
      features/                     # Pagine raggruppate per ruolo
        auth/                       # Pagine pubbliche di autenticazione
          login/                    #   LoginPage: email/password, remember me, segnalazione rapida
          registrazione/            #   RegistrazionePage: form registrazione studente
          recupera-password/        #   RecuperaPasswordPage: richiesta reset via email
          reset-password/           #   ResetPasswordPage: codice + nuova password
        home/                       # Landing page pubblica
          home.page.ts/html/scss
        studente/                   # 9 pagine studente
          dashboard-studente/
          elenco-docenti/
          prenota/                  #   Calendario settimanale interattivo
          dettaglio-prenotazione/   #   Mappa Leaflet, GPS, documenti
          riepilogo-prenotazioni/   #   Storico con filtri
          bacheca-studente/         #   FAQ accordion, link utili
          segnalazioni-studente/    #   Form + storico
          notifiche-studente/       #   Lista filtri badge
          profilo-studente/         #   Modifica + cambio password + dark mode
        docente/                    # 10 pagine docente
          dashboard-docente/
          prenotazioni-ricevute/    #   Lista + filtri + PDF agenda
          dettaglio-prenotazione-docente/
          gestione-slot/            #   CRUD slot calendario
          bacheche-docente/         #   CRUD FAQ per corso
          segnalazioni-docente/
          documenti-docente/        #   Archivio documenti studenti
          notifiche-docente/
          statistiche-docente/      #   Grafici stati e argomenti
          profilo-docente/
        admin/                      # 6 pagine admin
          dashboard-admin/
          gestione-utenti-admin/    #   CRUD multi-ruolo
          gestione-prenotazioni-admin/
          gestione-segnalazioni/    #   Flusso APERTA→LAVORAZIONE→RISOLTA
          gestione-slot-admin/      #   CRUD slot per qualsiasi docente
          gestione-calendario/      #   Blocco/sblocco giorni festivi
    assets/
      icon/
        calendar.svg                # Icona calendario
        unimeet-logo.svg            # Logo UniMeet
  angular.json                      # Configurazione Angular CLI
  capacitor.config.ts               # Configurazione Capacitor (app mobile)
  ionic.config.json                 # Configurazione Ionic
  karma.conf.js                     # Configurazione test Karma
  tsconfig.json / tsconfig.app.json # Configurazione TypeScript
  .browserslistrc                   # Browser target supportati
  package.json                      # Dipendenze e script
```

---

<div align="center">
  <br><br>
  <hr width="50%">
  <p><em>Documentazione generata il 24 Maggio 2026</em></p>
  <p><strong>UniMeet</strong> — Programmazione Web e Mobile</p>
  <img src="pg_frontend/src/assets/icon/unimeet-logo.svg" alt="UniMeet" width="200">
  <br><br>
</div>
