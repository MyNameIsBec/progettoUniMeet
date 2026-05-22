-- DropForeignKey
ALTER TABLE "Segnalazione" DROP CONSTRAINT "Segnalazione_matricola_studente_fkey";

-- AlterTable
ALTER TABLE "Segnalazione" ADD COLUMN     "id_docente" TEXT,
ALTER COLUMN "matricola_studente" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Segnalazione" ADD CONSTRAINT "Segnalazione_matricola_studente_fkey" FOREIGN KEY ("matricola_studente") REFERENCES "Studente"("matricola") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segnalazione" ADD CONSTRAINT "Segnalazione_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "Docente"("id_docente") ON DELETE SET NULL ON UPDATE CASCADE;
