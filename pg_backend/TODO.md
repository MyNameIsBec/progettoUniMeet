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

## Fase 3 — API Corsi
- [ ] CRUD Corsi (solo Docente/Admin crea/modifica)
- [ ] Associazione Corso ↔ Docente

## Fase 4 — API Bacheca e FAQ
- [ ] CRUD Bacheca (una per corso)
- [ ] CRUD FAQ (associate a una bacheca)

## Fase 5 — API Ricevimento
- [ ] CRUD SlotRicevimento (Docente crea i propri slot)
- [ ] CRUD LuogoRicevimento (associato a uno slot)

## Fase 6 — API Prenotazioni
- [ ] CRUD Prenotazione (Studente prenota uno slot)
- [ ] Gestione stato: IN_ATTESA → CONFERMATO / RIFIUTATO
- [ ] Upload Documenti associati a una prenotazione

## Fase 7 — API Notifiche
- [ ] CRUD Notifiche

## Fase 8 — Amministratore (Dashboard)
- [x] Statistiche (utenze, prenotazioni, corsi)
- [x] API gestione utenti (lista, crea, modifica, elimina)
- [x] API slot globali con filtri
- [x] Pagina Gestione Utenti frontend (tabella, ricerca, CRUD)
- [x] Pagina Gestione Slot Admin frontend (filtri, griglia slot)
- [ ] Aggiustare le scritte che non si vedono nei form
- [ ] Permettere all'amministratore di gestire le prenotazioni (eliminarle o modificarle)
- [ ] Consentire all'amministratore di bloccare determinati giorni dal calendario (es. festivi)
- [ ] Eliminare la possibilità di cambiare ruoli agli utenti (inutile)
