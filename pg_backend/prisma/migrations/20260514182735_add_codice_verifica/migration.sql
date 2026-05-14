-- Add columns as nullable first
ALTER TABLE "Notifica" ADD COLUMN     "destinatario_id" TEXT;
ALTER TABLE "Notifica" ADD COLUMN     "destinatario_ruolo" TEXT;
ALTER TABLE "Notifica" ADD COLUMN     "letta" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Notifica" ADD COLUMN     "titolo" TEXT;

-- Fill existing rows with default values
UPDATE "Notifica" SET "destinatario_id" = 'MIGRAZIONE', "destinatario_ruolo" = 'STUDENTE', "titolo" = 'Notifica';
ALTER TABLE "Notifica" ALTER COLUMN "destinatario_id" SET NOT NULL;
ALTER TABLE "Notifica" ALTER COLUMN "destinatario_ruolo" SET NOT NULL;
ALTER TABLE "Notifica" ALTER COLUMN "titolo" SET NOT NULL;

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

-- CreateTable
CREATE TABLE "GiornoBloccato" (
    "id_giorno" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "motivo" TEXT NOT NULL DEFAULT 'Festivo',
    "creato_il" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiornoBloccato_pkey" PRIMARY KEY ("id_giorno")
);

-- CreateTable
CREATE TABLE "CodiceVerifica" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codice" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'reset_password',
    "scadenza" TIMESTAMP(3) NOT NULL,
    "usato" BOOLEAN NOT NULL DEFAULT false,
    "creato_il" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodiceVerifica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiornoBloccato_data_key" ON "GiornoBloccato"("data");

-- CreateIndex
CREATE INDEX "CodiceVerifica_email_tipo_idx" ON "CodiceVerifica"("email", "tipo");

-- AddForeignKey
ALTER TABLE "Segnalazione" ADD CONSTRAINT "Segnalazione_matricola_studente_fkey" FOREIGN KEY ("matricola_studente") REFERENCES "Studente"("matricola") ON DELETE RESTRICT ON UPDATE CASCADE;
