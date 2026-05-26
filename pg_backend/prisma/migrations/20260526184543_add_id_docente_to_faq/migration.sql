-- AlterTable
ALTER TABLE "FAQ" ADD COLUMN     "id_docente" TEXT;

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "Docente"("id_docente") ON DELETE SET NULL ON UPDATE CASCADE;
