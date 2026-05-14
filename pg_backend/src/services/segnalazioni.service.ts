import { prisma } from '../prisma/client';

export interface SegnalazioneConStudente {
  id_segnalazione: string;
  oggetto: string;
  descrizione: string;
  data_invio: string;
  stato: string;
  matricola_studente: string;
  studente: {
    nome: string;
    cognome: string;
    email: string;
  };
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
    studente: {
      nome: s.studente.nome,
      cognome: s.studente.cognome,
      email: s.studente.email,
    },
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
    },
  });

  return {
    id_segnalazione: updated.id_segnalazione,
    oggetto: updated.oggetto,
    descrizione: updated.descrizione,
    data_invio: updated.data_invio.toISOString(),
    stato: updated.stato,
    matricola_studente: updated.matricola_studente,
    studente: {
      nome: updated.studente.nome,
      cognome: updated.studente.cognome,
      email: updated.studente.email,
    },
  };
}
