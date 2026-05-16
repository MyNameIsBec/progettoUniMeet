-- DropForeignKey
ALTER TABLE "Bacheca" DROP CONSTRAINT "Bacheca_id_corso_fkey";

-- DropIndex
DROP INDEX "Bacheca_id_corso_key";

-- AlterTable
ALTER TABLE "Bacheca" DROP COLUMN "id_corso",
ADD COLUMN     "id_corso_di_studi" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notifica" ALTER COLUMN "destinatario_id" DROP NOT NULL,
ALTER COLUMN "destinatario_ruolo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Prenotazione" ADD COLUMN     "descrizione" TEXT;

-- AlterTable
ALTER TABLE "Studente" DROP COLUMN "corso_di_studi",
ADD COLUMN     "id_corso_di_studi" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CorsoDiStudi" (
    "id_corso_di_studi" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "CorsoDiStudi_pkey" PRIMARY KEY ("id_corso_di_studi")
);

-- CreateTable
CREATE TABLE "DocenteCorsoDiStudi" (
    "id_docente" TEXT NOT NULL,
    "id_corso_di_studi" TEXT NOT NULL,

    CONSTRAINT "DocenteCorsoDiStudi_pkey" PRIMARY KEY ("id_docente","id_corso_di_studi")
);

-- CreateIndex
CREATE UNIQUE INDEX "CorsoDiStudi_nome_key" ON "CorsoDiStudi"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Bacheca_id_corso_di_studi_key" ON "Bacheca"("id_corso_di_studi");

-- AddForeignKey
ALTER TABLE "Studente" ADD CONSTRAINT "Studente_id_corso_di_studi_fkey" FOREIGN KEY ("id_corso_di_studi") REFERENCES "CorsoDiStudi"("id_corso_di_studi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocenteCorsoDiStudi" ADD CONSTRAINT "DocenteCorsoDiStudi_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "Docente"("id_docente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocenteCorsoDiStudi" ADD CONSTRAINT "DocenteCorsoDiStudi_id_corso_di_studi_fkey" FOREIGN KEY ("id_corso_di_studi") REFERENCES "CorsoDiStudi"("id_corso_di_studi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bacheca" ADD CONSTRAINT "Bacheca_id_corso_di_studi_fkey" FOREIGN KEY ("id_corso_di_studi") REFERENCES "CorsoDiStudi"("id_corso_di_studi") ON DELETE RESTRICT ON UPDATE CASCADE;

