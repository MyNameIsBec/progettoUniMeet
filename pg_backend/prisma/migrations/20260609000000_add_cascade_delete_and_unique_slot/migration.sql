-- Drop existing foreign keys and recreate with ON DELETE CASCADE
-- Also add unique constraint on SlotRicevimento(id_docente, data)

-- Corso -> Docente
ALTER TABLE "Corso" DROP CONSTRAINT "Corso_id_docente_fkey";
ALTER TABLE "Corso" ADD CONSTRAINT "Corso_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "Docente"("id_docente") ON DELETE CASCADE ON UPDATE CASCADE;

-- FAQ -> Bacheca
ALTER TABLE "FAQ" DROP CONSTRAINT "FAQ_id_bacheca_fkey";
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_id_bacheca_fkey" FOREIGN KEY ("id_bacheca") REFERENCES "Bacheca"("id_bacheca") ON DELETE CASCADE ON UPDATE CASCADE;

-- Segnalazione -> Studente (was SET NULL)
ALTER TABLE "Segnalazione" DROP CONSTRAINT "Segnalazione_matricola_studente_fkey";
ALTER TABLE "Segnalazione" ADD CONSTRAINT "Segnalazione_matricola_studente_fkey" FOREIGN KEY ("matricola_studente") REFERENCES "Studente"("matricola") ON DELETE CASCADE ON UPDATE CASCADE;

-- Segnalazione -> Docente (was SET NULL)
ALTER TABLE "Segnalazione" DROP CONSTRAINT "Segnalazione_id_docente_fkey";
ALTER TABLE "Segnalazione" ADD CONSTRAINT "Segnalazione_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "Docente"("id_docente") ON DELETE CASCADE ON UPDATE CASCADE;

-- SlotRicevimento -> Docente
ALTER TABLE "SlotRicevimento" DROP CONSTRAINT "SlotRicevimento_id_docente_fkey";
ALTER TABLE "SlotRicevimento" ADD CONSTRAINT "SlotRicevimento_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "Docente"("id_docente") ON DELETE CASCADE ON UPDATE CASCADE;

-- LuogoRicevimento -> SlotRicevimento
ALTER TABLE "LuogoRicevimento" DROP CONSTRAINT "LuogoRicevimento_id_slot_fkey";
ALTER TABLE "LuogoRicevimento" ADD CONSTRAINT "LuogoRicevimento_id_slot_fkey" FOREIGN KEY ("id_slot") REFERENCES "SlotRicevimento"("id_slot") ON DELETE CASCADE ON UPDATE CASCADE;

-- Prenotazione -> SlotRicevimento
ALTER TABLE "Prenotazione" DROP CONSTRAINT "Prenotazione_id_slot_fkey";
ALTER TABLE "Prenotazione" ADD CONSTRAINT "Prenotazione_id_slot_fkey" FOREIGN KEY ("id_slot") REFERENCES "SlotRicevimento"("id_slot") ON DELETE CASCADE ON UPDATE CASCADE;

-- Prenotazione -> Studente
ALTER TABLE "Prenotazione" DROP CONSTRAINT "Prenotazione_matricola_studente_fkey";
ALTER TABLE "Prenotazione" ADD CONSTRAINT "Prenotazione_matricola_studente_fkey" FOREIGN KEY ("matricola_studente") REFERENCES "Studente"("matricola") ON DELETE CASCADE ON UPDATE CASCADE;

-- Documento -> Prenotazione
ALTER TABLE "Documento" DROP CONSTRAINT "Documento_id_prenotazione_fkey";
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_id_prenotazione_fkey" FOREIGN KEY ("id_prenotazione") REFERENCES "Prenotazione"("id_prenotazione") ON DELETE CASCADE ON UPDATE CASCADE;

-- Unique constraint: a docente cannot have two slots on the same day
CREATE UNIQUE INDEX "SlotRicevimento_id_docente_data_key" ON "SlotRicevimento"("id_docente", "data");
ALTER TABLE "SlotRicevimento" ADD CONSTRAINT "SlotRicevimento_id_docente_data_key" UNIQUE USING INDEX "SlotRicevimento_id_docente_data_key";
