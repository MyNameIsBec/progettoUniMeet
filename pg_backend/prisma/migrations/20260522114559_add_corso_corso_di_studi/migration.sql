-- AlterTable
ALTER TABLE "Corso" ADD COLUMN     "id_corso_di_studi" TEXT;

-- AddForeignKey
ALTER TABLE "Corso" ADD CONSTRAINT "Corso_id_corso_di_studi_fkey" FOREIGN KEY ("id_corso_di_studi") REFERENCES "CorsoDiStudi"("id_corso_di_studi") ON DELETE SET NULL ON UPDATE CASCADE;
