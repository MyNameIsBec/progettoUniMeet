-- AlterTable
ALTER TABLE "Amministratore" ADD COLUMN     "two_factor_abilitato" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Docente" ADD COLUMN     "two_factor_abilitato" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Studente" ADD COLUMN     "two_factor_abilitato" BOOLEAN NOT NULL DEFAULT false;
