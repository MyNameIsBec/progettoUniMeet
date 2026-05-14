/*
  Warnings:

  - Added the required column `matricola_studente` to the `Notifica` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titolo` to the `Notifica` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notifica" ADD COLUMN     "letta" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matricola_studente" TEXT NOT NULL,
ADD COLUMN     "titolo" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Segnalazione" (
    "id_segnalazione" TEXT NOT NULL,
    "oggetto" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "data_invio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stato" TEXT NOT NULL DEFAULT 'APERTA',
    "matricola_studente" TEXT NOT NULL,

    CONSTRAINT "Segnalazione_pkey" PRIMARY KEY ("id_segnalazione")
);

-- AddForeignKey
ALTER TABLE "Segnalazione" ADD CONSTRAINT "Segnalazione_matricola_studente_fkey" FOREIGN KEY ("matricola_studente") REFERENCES "Studente"("matricola") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifica" ADD CONSTRAINT "Notifica_matricola_studente_fkey" FOREIGN KEY ("matricola_studente") REFERENCES "Studente"("matricola") ON DELETE RESTRICT ON UPDATE CASCADE;
