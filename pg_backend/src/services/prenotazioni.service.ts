import { prisma } from '../prisma/client';

export async function createPrenotazione(data: {
  matricolaStudente: string;
  idSlot: string;
  argomento: string;
}) {
  const slot = await prisma.slotRicevimento.findUnique({
    where: { id_slot: data.idSlot },
    include: { docente: true },
  });
  if (!slot) throw new Error('Slot not found');
  if (!slot.disponibilita) throw new Error('Slot non disponibile');

  const prenotazione = await prisma.prenotazione.create({
    data: {
      matricola_studente: data.matricolaStudente,
      id_slot: data.idSlot,
      argomento: data.argomento,
    },
    include: {
      studente: { select: { matricola: true, nome: true, cognome: true } },
      slot: {
        include: {
          docente: { select: { id_docente: true, nome: true, cognome: true } },
          luogo: true,
        },
      },
    },
  });

  return {
    id: prenotazione.id_prenotazione,
    studenteId: prenotazione.matricola_studente,
    slotId: prenotazione.id_slot,
    docente: `${prenotazione.slot.docente.nome} ${prenotazione.slot.docente.cognome}`,
    data: prenotazione.slot.data.toISOString().split('T')[0],
    ora: `${prenotazione.slot.ora_inizio.toISOString().split('T')[1]?.substring(0, 5)}`,
    luogo: prenotazione.slot.luogo?.nome_aula ?? '',
    argomento: prenotazione.argomento,
    stato: prenotazione.stato_prenotazione.toLowerCase(),
  };
}

export async function annullaPrenotazione(id: string) {
  const prenotazione = await prisma.prenotazione.findUnique({ where: { id_prenotazione: id } });
  if (!prenotazione) throw new Error('Prenotazione not found');

  await prisma.prenotazione.update({
    where: { id_prenotazione: id },
    data: { stato_prenotazione: 'ANNULLATA' },
  });
}

export async function getPrenotazioniStudente(matricolaStudente: string) {
  const prenotazioni = await prisma.prenotazione.findMany({
    where: { matricola_studente: matricolaStudente },
    include: {
      slot: {
        include: {
          docente: { select: { id_docente: true, nome: true, cognome: true } },
          luogo: true,
        },
      },
    },
    orderBy: { slot: { data: 'desc' } },
  });

  return prenotazioni.map((p) => ({
    id: p.id_prenotazione,
    studenteId: p.matricola_studente,
    slotId: p.id_slot,
    docente: `${p.slot.docente.nome} ${p.slot.docente.cognome}`,
    data: p.slot.data.toISOString().split('T')[0],
    ora: `${p.slot.ora_inizio.toISOString().split('T')[1]?.substring(0, 5)}`,
    luogo: p.slot.luogo?.nome_aula ?? '',
    argomento: p.argomento,
    stato: p.stato_prenotazione.toLowerCase(),
  }));
}

export async function getPrenotazioniDocente(idDocente: string) {
  const prenotazioni = await prisma.prenotazione.findMany({
    where: { slot: { id_docente: idDocente } },
    include: {
      studente: { select: { matricola: true, nome: true, cognome: true } },
      slot: {
        include: { luogo: true },
      },
    },
    orderBy: { slot: { data: 'desc' } },
  });

  return prenotazioni.map((p) => ({
    id: p.id_prenotazione,
    studenteId: p.matricola_studente,
    slotId: p.id_slot,
    studente: `${p.studente.nome} ${p.studente.cognome}`,
    data: p.slot.data.toISOString().split('T')[0],
    oraInizio: p.slot.ora_inizio.toISOString().split('T')[1]?.substring(0, 5),
    oraFine: p.slot.ora_fine.toISOString().split('T')[1]?.substring(0, 5),
    luogo: p.slot.luogo?.nome_aula ?? '',
    argomento: p.argomento,
    stato: p.stato_prenotazione.toLowerCase(),
  }));
}

export async function aggiornaStatoPrenotazione(id: string, stato: string) {
  const prenotazione = await prisma.prenotazione.findUnique({ where: { id_prenotazione: id } });
  if (!prenotazione) throw new Error('Prenotazione not found');

  const updated = await prisma.prenotazione.update({
    where: { id_prenotazione: id },
    data: { stato_prenotazione: stato },
    include: {
      slot: {
        include: {
          docente: { select: { id_docente: true, nome: true, cognome: true } },
          luogo: true,
        },
      },
    },
  });

  return {
    id: updated.id_prenotazione,
    studenteId: updated.matricola_studente,
    slotId: updated.id_slot,
    docente: `${updated.slot.docente.nome} ${updated.slot.docente.cognome}`,
    data: updated.slot.data.toISOString().split('T')[0],
    ora: `${updated.slot.ora_inizio.toISOString().split('T')[1]?.substring(0, 5)}`,
    luogo: updated.slot.luogo?.nome_aula ?? '',
    argomento: updated.argomento,
    stato: updated.stato_prenotazione.toLowerCase(),
  };
}


export async function getPrenotazioneById(id: string) {
  const prenotazione = await prisma.prenotazione.findUnique({
    where: { id_prenotazione: id },
    include: {
      studente: { select: { matricola: true, nome: true, cognome: true } },
      slot: {
        include: { docente: true, luogo: true },
      },
    },
  });

  if (!prenotazione) throw new Error('Prenotazione not found');

  return {
    id: prenotazione.id_prenotazione,
    studenteId: prenotazione.matricola_studente,
    slotId: prenotazione.id_slot,
    docente: `${prenotazione.slot.docente.nome} ${prenotazione.slot.docente.cognome}`,
    data: prenotazione.slot.data.toISOString().split('T')[0],
    ora: `${prenotazione.slot.ora_inizio.toISOString().split('T')[1]?.substring(0, 5)}`,
    luogo: prenotazione.slot.luogo?.nome_aula ?? '',
    argomento: prenotazione.argomento,
    stato: prenotazione.stato_prenotazione.toLowerCase(),
  };
}