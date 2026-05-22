import { prisma } from '../prisma/client';

export interface SegnalazioneConStudente {
  id_segnalazione: string;
  oggetto: string;
  descrizione: string;
  data_invio: string;
  stato: string;
  matricola_studente: string | null;
  id_docente: string | null;
  studente: {
    nome: string;
    cognome: string;
    email: string;
  } | null;
  docente: {
    nome: string;
    cognome: string;
    email: string;
  } | null;
}

export async function createSegnalazione(data: {
  oggetto: string;
  descrizione: string;
  matricola_studente: string;
}) {
  const studente = await prisma.studente.findUnique({
    where: { matricola: data.matricola_studente },
  });
  if (!studente) throw new Error('Studente not found');

  const segnalazione = await prisma.segnalazione.create({
    data: {
      oggetto: data.oggetto,
      descrizione: data.descrizione,
      matricola_studente: data.matricola_studente,
    },
  });

  return {
    id_segnalazione: segnalazione.id_segnalazione,
    oggetto: segnalazione.oggetto,
    descrizione: segnalazione.descrizione,
    data_invio: segnalazione.data_invio.toISOString(),
    stato: segnalazione.stato,
    matricola_studente: segnalazione.matricola_studente,
  };
}

export async function getSegnalazioniByStudente(matricola: string) {
  const segnalazioni = await prisma.segnalazione.findMany({
    where: { matricola_studente: matricola },
    orderBy: { data_invio: 'desc' },
  });

  return segnalazioni.map((s) => ({
    id_segnalazione: s.id_segnalazione,
    oggetto: s.oggetto,
    descrizione: s.descrizione,
    data_invio: s.data_invio.toISOString(),
    stato: s.stato,
    matricola_studente: s.matricola_studente,
  }));
}

export async function getAllSegnalazioni(stato?: string): Promise<SegnalazioneConStudente[]> {
  const where: any = {};
  if (stato) where.stato = stato;

  const segnalazioni = await prisma.segnalazione.findMany({
    where,
    include: {
      studente: { select: { nome: true, cognome: true, email: true } },
      docente: { select: { nome: true, cognome: true, email: true } },
    },
    orderBy: { data_invio: 'desc' },
  });

  return segnalazioni.map((s) => ({
    id_segnalazione: s.id_segnalazione,
    oggetto: s.oggetto,
    descrizione: s.descrizione,
    data_invio: s.data_invio.toISOString(),
    stato: s.stato,
    matricola_studente: s.matricola_studente,
    id_docente: s.id_docente,
    studente: s.studente,
    docente: s.docente,
  }));
}

export async function aggiornaStatoSegnalazione(id: string, stato: string) {
  const statiValidi = ['APERTA', 'IN_LAVORAZIONE', 'CHIUSA'];
  if (!statiValidi.includes(stato)) throw new Error('Stato non valido');

  const segnalazione = await prisma.segnalazione.findUnique({
    where: { id_segnalazione: id },
  });
  if (!segnalazione) throw new Error('Segnalazione not found');

  const updated = await prisma.segnalazione.update({
    where: { id_segnalazione: id },
    data: { stato },
    include: {
      studente: { select: { nome: true, cognome: true, email: true } },
      docente: { select: { nome: true, cognome: true, email: true } },
    },
  });

  return {
    id_segnalazione: updated.id_segnalazione,
    oggetto: updated.oggetto,
    descrizione: updated.descrizione,
    data_invio: updated.data_invio.toISOString(),
    stato: updated.stato,
    matricola_studente: updated.matricola_studente,
    id_docente: updated.id_docente,
    studente: updated.studente,
    docente: updated.docente,
  };
}
export async function eliminaSegnalazione(id: string) {
  const segnalazione = await prisma.segnalazione.findUnique({
    where: { id_segnalazione: id },
  });
  if (!segnalazione) throw new Error('Segnalazione not found');

  await prisma.segnalazione.delete({
    where: { id_segnalazione: id },
  });
}

export async function createSegnalazioneDocente(data: {
  oggetto: string;
  descrizione: string;
  id_docente: string;
}) {
  const docente = await prisma.docente.findUnique({
    where: { id_docente: data.id_docente },
  });
  if (!docente) throw new Error('Docente not found');

  const segnalazione = await prisma.segnalazione.create({
    data: {
      oggetto: data.oggetto,
      descrizione: data.descrizione,
      id_docente: data.id_docente,
    },
  });

  return {
    id_segnalazione: segnalazione.id_segnalazione,
    oggetto: segnalazione.oggetto,
    descrizione: segnalazione.descrizione,
    data_invio: segnalazione.data_invio.toISOString(),
    stato: segnalazione.stato,
    id_docente: segnalazione.id_docente,
  };
}

export async function getSegnalazioniByDocente(idDocente: string) {
  const segnalazioni = await prisma.segnalazione.findMany({
    where: { id_docente: idDocente },
    orderBy: { data_invio: 'desc' },
  });

  return segnalazioni.map((s) => ({
    id_segnalazione: s.id_segnalazione,
    oggetto: s.oggetto,
    descrizione: s.descrizione,
    data_invio: s.data_invio.toISOString(),
    stato: s.stato,
    id_docente: s.id_docente,
  }));
}
