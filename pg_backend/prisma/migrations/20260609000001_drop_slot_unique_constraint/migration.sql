-- Drop the unique constraint on SlotRicevimento(id_docente, data)
-- A docente can have multiple slots on the same day (different times)
ALTER TABLE "SlotRicevimento" DROP CONSTRAINT "SlotRicevimento_id_docente_data_key";
DROP INDEX IF EXISTS "SlotRicevimento_id_docente_data_key";
