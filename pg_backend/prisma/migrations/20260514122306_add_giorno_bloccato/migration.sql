-- CreateTable
CREATE TABLE "GiornoBloccato" (
    "id_giorno" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "motivo" TEXT NOT NULL DEFAULT 'Festivo',
    "creato_il" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiornoBloccato_pkey" PRIMARY KEY ("id_giorno")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiornoBloccato_data_key" ON "GiornoBloccato"("data");
