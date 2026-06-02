import { prisma } from '../prisma/client';

async function notificaTuttiAdmin(titolo: string, messaggio: string, tipo: string) {
  const admin = await prisma.amministratore.findMany({ select: { id_admin: true } });
  for (const a of admin) {
    await prisma.notifica.create({
      data: {
        titolo, messaggio, tipo,
        destinatario_id: a.id_admin,
        destinatario_ruolo: 'AMMINISTRATORE',
      },
    });
  }
}

export interface SegnalazioneConStudente {
  id_segnalazione: string;
  oggetto: string;
  descrizione: string;
  data_invio: string;
  stato: string;
  matricola_studente: string | null;
  id_docente: string | null;
  allegato: string | null;
  note_admin: string | null;
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
  allegato?: string;
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
      allegato: data.allegato ?? null,
    },
  });

  notificaTuttiAdmin(
    'Nuova segnalazione studente',
    `Nuova segnalazione da ${studente.nome} ${studente.cognome}: ${data.oggetto}`,
    'nuova_segnalazione'
  );

  return {
    id_segnalazione: segnalazione.id_segnalazione,
    oggetto: segnalazione.oggetto,
    descrizione: segnalazione.descrizione,
    data_invio: segnalazione.data_invio.toISOString(),
    stato: segnalazione.stato,
    matricola_studente: segnalazione.matricola_studente,
    allegato: segnalazione.allegato,
    note_admin: segnalazione.note_admin,
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
    allegato: s.allegato,
    note_admin: s.note_admin,
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
    allegato: s.allegato,
    note_admin: s.note_admin,
    studente: s.studente,
    docente: s.docente,
  }));
}

export async function aggiornaStatoSegnalazione(id: string, stato: string, noteAdmin?: string) {
  const statiValidi = ['APERTA', 'IN_LAVORAZIONE', 'CHIUSA'];
  if (!statiValidi.includes(stato)) throw new Error('Stato non valido');

  const segnalazione = await prisma.segnalazione.findUnique({
    where: { id_segnalazione: id },
  });
  if (!segnalazione) throw new Error('Segnalazione not found');

  const data: any = { stato };
  if (noteAdmin !== undefined) data.note_admin = noteAdmin;

  const updated = await prisma.segnalazione.update({
    where: { id_segnalazione: id },
    data,
    include: {
      studente: { select: { nome: true, cognome: true, email: true } },
      docente: { select: { nome: true, cognome: true, email: true } },
    },
  });

  let msgSuffix = '';
  if (noteAdmin) msgSuffix = ` Note: ${noteAdmin}`;

  if (updated.matricola_studente) {
    await prisma.notifica.create({
      data: {
        titolo: 'Stato segnalazione aggiornato',
        messaggio: `La tua segnalazione "${updated.oggetto}" è ora ${stato}.${msgSuffix}`,
        tipo: 'stato_segnalazione',
        destinatario_id: updated.matricola_studente,
        destinatario_ruolo: 'STUDENTE',
      },
    });
  }
  if (updated.id_docente) {
    await prisma.notifica.create({
      data: {
        titolo: 'Stato segnalazione aggiornato',
        messaggio: `La tua segnalazione "${updated.oggetto}" è ora ${stato}.${msgSuffix}`,
        tipo: 'stato_segnalazione',
        destinatario_id: updated.id_docente,
        destinatario_ruolo: 'DOCENTE',
      },
    });
  }

  return {
    id_segnalazione: updated.id_segnalazione,
    oggetto: updated.oggetto,
    descrizione: updated.descrizione,
    data_invio: updated.data_invio.toISOString(),
    stato: updated.stato,
    matricola_studente: updated.matricola_studente,
    id_docente: updated.id_docente,
    allegato: updated.allegato,
    note_admin: updated.note_admin,
    studente: updated.studente,
    docente: updated.docente,
  };
}
export async function getSegnalazioneById(id: string) {
  const segnalazione = await prisma.segnalazione.findUnique({
    where: { id_segnalazione: id },
  });
  return segnalazione;
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
  allegato?: string;
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
      allegato: data.allegato ?? null,
    },
  });

  notificaTuttiAdmin(
    'Nuova segnalazione docente',
    `Nuova segnalazione dal docente ${docente.nome} ${docente.cognome}: ${data.oggetto}`,
    'nuova_segnalazione'
  );

  return {
    id_segnalazione: segnalazione.id_segnalazione,
    oggetto: segnalazione.oggetto,
    descrizione: segnalazione.descrizione,
    data_invio: segnalazione.data_invio.toISOString(),
    stato: segnalazione.stato,
    id_docente: segnalazione.id_docente,
    allegato: segnalazione.allegato,
    note_admin: segnalazione.note_admin,
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
    allegato: s.allegato,
    note_admin: s.note_admin,
  }));
}
