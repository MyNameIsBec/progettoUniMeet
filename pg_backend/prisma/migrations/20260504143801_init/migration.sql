-- CreateTable
CREATE TABLE "Studente" (
    "matricola" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "corso_di_studi" TEXT NOT NULL,

    CONSTRAINT "Studente_pkey" PRIMARY KEY ("matricola")
);

-- CreateTable
CREATE TABLE "Docente" (
    "id_docente" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "ufficio" TEXT NOT NULL,

    CONSTRAINT "Docente_pkey" PRIMARY KEY ("id_docente")
);

-- CreateTable
CREATE TABLE "Amministratore" (
    "id_admin" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Amministratore_pkey" PRIMARY KEY ("id_admin")
);

-- CreateTable
CREATE TABLE "Corso" (
    "id_corso" TEXT NOT NULL,
    "nome_corso" TEXT NOT NULL,
    "anno" INTEGER NOT NULL,
    "cfu" INTEGER NOT NULL,
    "id_docente" TEXT NOT NULL,

    CONSTRAINT "Corso_pkey" PRIMARY KEY ("id_corso")
);

-- CreateTable
CREATE TABLE "Bacheca" (
    "id_bacheca" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "data_ultimo_aggiornamento" TIMESTAMP(3) NOT NULL,
    "id_corso" TEXT NOT NULL,

    CONSTRAINT "Bacheca_pkey" PRIMARY KEY ("id_bacheca")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id_faq" TEXT NOT NULL,
    "domanda" TEXT NOT NULL,
    "risposta" TEXT NOT NULL,
    "data_pubblicazione" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_modifica" TIMESTAMP(3) NOT NULL,
    "id_bacheca" TEXT NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id_faq")
);

-- CreateTable
CREATE TABLE "SlotRicevimento" (
    "id_slot" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "ora_inizio" TIME NOT NULL,
    "ora_fine" TIME NOT NULL,
    "disponibilita" BOOLEAN NOT NULL DEFAULT true,
    "id_docente" TEXT NOT NULL,

    CONSTRAINT "SlotRicevimento_pkey" PRIMARY KEY ("id_slot")
);

-- CreateTable
CREATE TABLE "LuogoRicevimento" (
    "id_luogo" TEXT NOT NULL,
    "nome_aula" TEXT NOT NULL,
    "edificio" TEXT NOT NULL,
    "piano" TEXT NOT NULL,
    "latitudine" DOUBLE PRECISION,
    "longitudine" DOUBLE PRECISION,
    "id_slot" TEXT NOT NULL,

    CONSTRAINT "LuogoRicevimento_pkey" PRIMARY KEY ("id_luogo")
);

-- CreateTable
CREATE TABLE "Prenotazione" (
    "id_prenotazione" TEXT NOT NULL,
    "data_prenotazione" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "argomento" TEXT NOT NULL,
    "stato_prenotazione" TEXT NOT NULL DEFAULT 'IN_ATTESA',
    "matricola_studente" TEXT NOT NULL,
    "id_slot" TEXT NOT NULL,

    CONSTRAINT "Prenotazione_pkey" PRIMARY KEY ("id_prenotazione")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id_documento" TEXT NOT NULL,
    "nome_file" TEXT NOT NULL,
    "tipo_file" TEXT NOT NULL,
    "dimensione" INTEGER NOT NULL,
    "data_caricamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "percorso_file" TEXT NOT NULL,
    "id_prenotazione" TEXT NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id_documento")
);

-- CreateTable
CREATE TABLE "Notifica" (
    "id_notifica" TEXT NOT NULL,
    "messaggio" TEXT NOT NULL,
    "data_invio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "Notifica_pkey" PRIMARY KEY ("id_notifica")
);

-- CreateIndex
CREATE UNIQUE INDEX "Studente_email_key" ON "Studente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Docente_email_key" ON "Docente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Amministratore_email_key" ON "Amministratore"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bacheca_id_corso_key" ON "Bacheca"("id_corso");

-- CreateIndex
CREATE UNIQUE INDEX "LuogoRicevimento_id_slot_key" ON "LuogoRicevimento"("id_slot");

-- AddForeignKey
ALTER TABLE "Corso" ADD CONSTRAINT "Corso_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "Docente"("id_docente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bacheca" ADD CONSTRAINT "Bacheca_id_corso_fkey" FOREIGN KEY ("id_corso") REFERENCES "Corso"("id_corso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_id_bacheca_fkey" FOREIGN KEY ("id_bacheca") REFERENCES "Bacheca"("id_bacheca") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotRicevimento" ADD CONSTRAINT "SlotRicevimento_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "Docente"("id_docente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LuogoRicevimento" ADD CONSTRAINT "LuogoRicevimento_id_slot_fkey" FOREIGN KEY ("id_slot") REFERENCES "SlotRicevimento"("id_slot") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prenotazione" ADD CONSTRAINT "Prenotazione_matricola_studente_fkey" FOREIGN KEY ("matricola_studente") REFERENCES "Studente"("matricola") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prenotazione" ADD CONSTRAINT "Prenotazione_id_slot_fkey" FOREIGN KEY ("id_slot") REFERENCES "SlotRicevimento"("id_slot") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_id_prenotazione_fkey" FOREIGN KEY ("id_prenotazione") REFERENCES "Prenotazione"("id_prenotazione") ON DELETE RESTRICT ON UPDATE CASCADE;
