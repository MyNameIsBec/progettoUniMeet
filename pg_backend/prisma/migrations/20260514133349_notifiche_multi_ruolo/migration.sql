/*
  Warnings:

  - You are about to drop the column `matricola_studente` on the `Notifica` table. All the data in the column will be lost.
  - Added the required column `destinatario_id` to the `Notifica` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinatario_ruolo` to the `Notifica` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notifica" DROP CONSTRAINT "Notifica_matricola_studente_fkey";

-- AlterTable
ALTER TABLE "Notifica" DROP COLUMN "matricola_studente",
ADD COLUMN     "destinatario_id" TEXT NOT NULL,
ADD COLUMN     "destinatario_ruolo" TEXT NOT NULL;
