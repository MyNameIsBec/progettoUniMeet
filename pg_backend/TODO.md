# TODO — Backend Prenotazioni Ricevimento

## Fase 1 — Ambiente e DB
- [x] Istruzioni/README per setup DB locale (PostgreSQL nativo)
- [x] Script `setup-db.sh` per automatizzare createdb + prisma migrate deploy
- [x] Verificare che la migrazione init sia applicata al DB
- [x] Script seed per dati di test

## Fase 2 — Autenticazione
- [x] Installare `jsonwebtoken` + `@types/jsonwebtoken`
- [x] Configurare `.env` con `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- [x] `login(email, password)` — Cerca su Studente → Docente → Amministratore, verifica password, restituisce `{ id, nome, cognome, email, role, token }`
- [x] `getProfile(userId, ruolo)` — Restituisce dati profilo
- [x] `refreshToken(token)` — Verifica refresh token, emette nuovo access token
- [x] `changePassword(userId, ruolo, oldPassword, newPassword)` — Cambio password
- [x] `forgotPassword(email)` — Genera reset token (15 min)
- [x] `resetPassword(token, nuovaPassword)` — Resetta password con token
- [x] Middleware `authenticate` — Protegge le rotte (verifica JWT, estrae utente)
- [x] `registerAdmin(data)` — Registrazione amministratore

## Fase 3 — API Corsi ✅
- [x] CRUD Corsi (solo Docente/Admin crea/modifica)
- [x] Associazione Corso ↔ Docente

## Fase 4 — API Bacheca e FAQ ✅
- [x] CRUD Bacheca (una per corso)
- [x] CRUD FAQ (associate a una bacheca)

## Fase 5 — API Ricevimento
- [ ] CRUD SlotRicevimento (Docente crea i propri slot)
- [ ] CRUD LuogoRicevimento (associato a uno slot)

## Fase 6 — API Prenotazioni
- [ ] CRUD Prenotazione (Studente prenota uno slot)
- [ ] Gestione stato: IN_ATTESA → CONFERMATO / RIFIUTATO
- [ ] Upload Documenti associati a una prenotazione

## Fase 7 — API Notifiche ✅ (multi-ruolo)
- [x] CRUD Notifiche (studente, docente, amministratore)
- [x] Schema: `destinatario_id` + `destinatario_ruolo` invece di solo `matricola_studente`
- [x] Migrazione applicata
- [x] Frontend: rotta `/notifiche` aperta a tutti gli autenticati

## Fase 10 — Segnalazioni (Completata)
- [x] API backend: service, controller, validators, routes
- [x] Pagina admin frontend: tabella, filtri stato, cambio stato inline
- [x] Voce menu "Segnalazioni" nel pannello admin

## Fase 11 — Blocca giorni (Completata)
- [x] Modello DB `GiornoBloccato` (data, motivo)
- [x] API backend: `GET/POST/DELETE /admin/giorni-bloccati`
- [x] Pagina admin frontend `gestione-calendario`
- [x] Voce menu "Calendario" nel pannello admin
- [x] Seed giorni festivi di test

## Fase 8 — Amministratore (Dashboard)
- [x] Statistiche (utenze, prenotazioni, corsi)
- [x] API gestione utenti (lista, crea, modifica, elimina)
- [x] API slot globali con filtri
- [x] Pagina Gestione Utenti frontend (tabella, ricerca, CRUD)
- [x] Pagina Gestione Slot Admin frontend (filtri, griglia slot)
- [x] Aggiustare le scritte che non si vedono nei form
- [ ] Permettere all'amministratore di gestire le prenotazioni (eliminarle o modificarle)
- [ ] → Spostato in Fase 11 (Blocca giorni)
- [ ] Eliminare la possibilità di cambiare ruoli agli utenti (inutile)

---

## Piano dettagliato Fase 11 — Blocca giorni

### Backend

**Modello DB (`prisma/schema.prisma`):**
```prisma
model GiornoBloccato {
  id_giorno String   @id @default(uuid())
  data      DateTime @db.Date
  motivo    String   @default("Festivo")
  creato_il DateTime @default(now())
  @@unique([data])
}
```

**Service (`admin.service.ts`):**
- `getGiorniBloccati()` → Prisma findMany ord. data
- `bloccaGiorno(data, motivo?)` → Prisma create (gestire unique constraint violato → 409)
- `sbloccaGiorno(id)` → Prisma delete

**Controller (`admin.controller.ts`):**
- `getGiorniBloccati` → 200
- `bloccaGiorno` → 201 (409 se data già bloccata)
- `sbloccaGiorno` → 204 (404 se non trovato)

**Routes (`admin.routes.ts`):**
- `GET    /api/admin/giorni-bloccati`
- `POST   /api/admin/giorni-bloccati`
- `DELETE /api/admin/giorni-bloccati/:id`

**Validators (`admin.validators.ts`):**
- `bloccaGiornoSchema`: body `data` (notEmpty, isISO8601), `motivo` (optional, trim)

**Seed (`seed.ts`):**
- 2026-04-25 "Festa della Liberazione", 2026-05-01 "Festa del Lavoro", 2026-06-02 "Festa della Repubblica"

### Frontend

**Service (`admin.ts` frontend):**
```ts
export interface GiornoBloccato {
  id: string; data: string; motivo: string; creatoIl: string;
}
getGiorniBloccati(): Observable<GiornoBloccato[]>
bloccaGiorno(dati: { data: string; motivo?: string }): Observable<GiornoBloccato>
sbloccaGiorno(id: string): Observable<void>
```

**Nuova pagina `features/admin/gestione-calendario/`:**
- Componente standalone con `DashboardLayout`
- Tabella giorni bloccati (data formattata, motivo, azioni)
- Badge "Bloccato" con icona lock
- Pulsante "Blocca giorno" → modale con date picker + motivo
- Bottone elimina su ogni riga con conferma
- Stili coerenti (border-radius 18px, ombre, palette blue)

**Rotta (`app.routes.ts`):**
```ts
{ path: 'gestione-calendario', canActivate: [authGuard, roleGuard('amministratore')],
  loadComponent: () => import('./features/admin/gestione-calendario/gestione-calendario.page').then(m => m.GestioneCalendarioPage) }
```

**Menu admin** — 5 file da modificare:
- `dashboard-layout.component.ts`
- `dashboard-admin.page.ts`
- `gestione-utenti/gestione-utenti.page.ts`
- `gestione-slot-admin/gestione-slot-admin.page.ts`
- `gestione-segnalazioni/gestione-segnalazioni.page.ts`

Aggiungere: `{ etichetta: 'Calendario', percorso: '/gestione-calendario', icona: 'calendar-outline' }`
