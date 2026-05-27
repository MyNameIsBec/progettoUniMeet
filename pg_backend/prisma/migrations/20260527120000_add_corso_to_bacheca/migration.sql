-- Clear existing data (restructuring: one bacheca per corso instead of one per corso_di_studi)
DELETE FROM "FAQ";
DELETE FROM "Bacheca";

-- Drop existing unique constraint on id_corso_di_studi
DROP INDEX IF EXISTS "Bacheca_id_corso_di_studi_key";

-- Add id_corso column
ALTER TABLE "Bacheca" ADD COLUMN "id_corso" TEXT NOT NULL;

-- Add unique constraint on id_corso
CREATE UNIQUE INDEX "Bacheca_id_corso_key" ON "Bacheca"("id_corso");

-- AddForeignKey
ALTER TABLE "Bacheca" ADD CONSTRAINT "Bacheca_id_corso_fkey" FOREIGN KEY ("id_corso") REFERENCES "Corso"("id_corso") ON DELETE RESTRICT ON UPDATE CASCADE;
