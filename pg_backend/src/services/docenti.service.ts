import { prisma } from '../prisma/client';

function getCorsoDiStudiIds(d: any): string[] {
  return d.corsi_di_studi?.map((cds: any) => cds.corso_di_studi.nome) ?? [];
}

export async function getElencoDocenti(filtri?: { corso?: string; search?: string }) {
  const where: any = {};

  if (filtri?.corso && filtri.corso !== 'tutti') {
    where.corsi_di_studi = {
      some: {
        corso_di_studi: { nome: { contains: filtri.corso, mode: 'insensitive' } },
      },
    };
  }

  if (filtri?.search) {
    const terms = filtri.search.trim().toLowerCase().split(/\s+/);
    where.AND = terms.map(term => ({
      OR: [
        { nome: { contains: term, mode: 'insensitive' } },
        { cognome: { contains: term, mode: 'insensitive' } },
      ]
    }));
  }

  const docenti = await prisma.docente.findMany({
    where,
    select: {
      id_docente: true,
      nome: true,
      cognome: true,
      email: true,
      ufficio: true,
      corsi: { select: { nome_corso: true } },
      corsi_di_studi: {
        select: { corso_di_studi: { select: { nome: true } } },
      },
    },
  });

  return docenti.map((d) => ({
    id: d.id_docente,
    nome: d.nome,
    cognome: d.cognome,
    email: d.email,
    ufficio: d.ufficio,
    materia: d.corsi?.[0]?.nome_corso ?? 'N/D',
    corsoDiStudi: getCorsoDiStudiIds(d),
    iniziali: `${d.nome?.[0] || ''}${d.cognome?.[0] || ''}`.toUpperCase() || '??',
    coloreAvatar: 'blue',
  }));
}

export async function getDettagliDocente(id: string) {
  const docente = await prisma.docente.findUnique({
    where: { id_docente: id },
    select: {
      id_docente: true,
      nome: true,
      cognome: true,
      email: true,
      ufficio: true,
      corsi: {
        select: {
          id_corso: true,
          nome_corso: true,
          cfu: true,
          anno: true
        }
      },
      corsi_di_studi: {
        select: {
          corso_di_studi: {
            select: {
              id_corso_di_studi: true,
              nome: true
            }
          }
        }
      }
    },
  });
  if (!docente) throw new Error('Docente not found');
  return {
    id: docente.id_docente,
    nome: docente.nome,
    cognome: docente.cognome,
    email: docente.email,
    ufficio: docente.ufficio,
    corsi: docente.corsi?.map(c => ({
      id: c.id_corso,
      nome: c.nome_corso,
      cfu: c.cfu,
      anno: c.anno
    })) ?? [],
    corsiDiStudi: docente.corsi_di_studi?.map(cds => ({
      id: cds.corso_di_studi.id_corso_di_studi,
      nome: cds.corso_di_studi.nome
    })) ?? []
  };
}

export async function getSlots(idDocente: string, mese?: string) {
  const where: any = { id_docente: idDocente };
  if (mese) {
    const parts = mese.split('-');
    const anno = parseInt(parts[0]!);
    const m = parseInt(parts[1]!) - 1;
    const start = new Date(anno, m, 1);
    const end = new Date(anno, m + 1, 0, 23, 59, 59);
    where.data = { gte: start, lte: end };
  }

  const slots = await prisma.slotRicevimento.findMany({
    where,
    include: {
      luogo: true,
      prenotazioni: { select: { id_prenotazione: true } },
    },
    orderBy: [{ data: 'asc' }, { ora_inizio: 'asc' }],
  });

  const fmtTime = (d: Date) => d.toISOString().split('T')[1]?.substring(0, 5) ?? '';

  return slots.map((s) => ({
    id: s.id_slot,
    docenteId: s.id_docente,
    data: s.data.toISOString().split('T')[0],
    oraInizio: fmtTime(s.ora_inizio),
    oraFine: fmtTime(s.ora_fine),
    disponibilita: s.disponibilita,
    stato: s.disponibilita ? 'disponibile' : 'occupato',
    luogo: s.luogo
      ? {
          id: s.luogo.id_luogo,
          aula: s.luogo.nome_aula,
          edificio: s.luogo.edificio,
          piano: s.luogo.piano,
        }
      : undefined,
    prenotazioniCount: s.prenotazioni.length,
  }));
}

export async function creaSlot(idDocente: string, data: {
  data: string;
  oraInizio: string;
  oraFine: string;
  luogo?: { nomeAula: string; edificio: string; piano: string };
}) {
  const dataSlot = new Date(data.data);
  const existing = await prisma.slotRicevimento.findFirst({
    where: {
      id_docente: idDocente,
      data: dataSlot
    }
  });

  if (existing) {
    throw new Error('Il docente ha già uno slot programmato per questa data. Massimo uno slot al giorno.');
  }

  // Verifica durata: massimo 1 ora
  const startStr = `${data.data}T${data.oraInizio}`;
  const endStr = `${data.data}T${data.oraFine}`;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffMs = end.getTime() - start.getTime();
  const diffMin = diffMs / (1000 * 60);

  if (diffMin > 60) {
    throw new Error('La durata dello slot non può superare 1 ora.');
  }

  const slot = await prisma.slotRicevimento.create({
    data: {
      data: new Date(data.data),
      ora_inizio: data.oraInizio as any,
      ora_fine: data.oraFine as any,
      id_docente: idDocente,
      ...(!data.luogo ? {} : {
        luogo: {
          create: {
            nome_aula: data.luogo.nomeAula,
            edificio: data.luogo.edificio,
            piano: data.luogo.piano,
          },
        },
      }),
    },
    include: { luogo: true },
  });

  const createdSlot = slot as any;

  return {
    id: createdSlot.id_slot,
    docenteId: createdSlot.id_docente,
    data: createdSlot.data.toISOString().split('T')[0],
    oraInizio: createdSlot.ora_inizio.toISOString().split('T')[1]?.substring(0, 5),
    oraFine: createdSlot.ora_fine.toISOString().split('T')[1]?.substring(0, 5),
    disponibilita: createdSlot.disponibilita,
    luogo: createdSlot.luogo
      ? { id: createdSlot.luogo.id_luogo, aula: createdSlot.luogo.nome_aula, edificio: createdSlot.luogo.edificio, piano: parseInt(createdSlot.luogo.piano) }
      : undefined,
  };
}

export async function modificaSlot(idDocente: string, idSlot: string, data: any) {
  const row = await prisma.slotRicevimento.findFirst({
    where: { id_slot: idSlot, id_docente: idDocente },
    include: { luogo: true },
  });
  if (!row) throw new Error('Slot not found');

  const updateData: any = {};
  if (data.data) updateData.data = new Date(data.data);
  if (data.oraInizio) updateData.ora_inizio = data.oraInizio as any;
  if (data.oraFine) updateData.ora_fine = data.oraFine as any;
  if (data.disponibilita !== undefined) updateData.disponibilita = data.disponibilita;

  await prisma.slotRicevimento.update({
    where: { id_slot: idSlot },
    data: updateData,
  });

  if (data.luogo) {
    if (row.luogo) {
      await prisma.luogoRicevimento.update({
        where: { id_luogo: row.luogo.id_luogo },
        data: {
          nome_aula: data.luogo.nomeAula,
          edificio: data.luogo.edificio,
          piano: data.luogo.piano,
        },
      });
    } else {
      await prisma.luogoRicevimento.create({
        data: {
          nome_aula: data.luogo.nomeAula,
          edificio: data.luogo.edificio,
          piano: data.luogo.piano,
          id_slot: idSlot,
        },
      });
    }
  }

  return { messaggio: 'Slot aggiornato con successo.' };
}

export async function eliminaSlot(idDocente: string, idSlot: string) {
  const slot = await prisma.slotRicevimento.findFirst({
    where: { id_slot: idSlot, id_docente: idDocente },
  });
  if (!slot) throw new Error('Slot not found');

  await prisma.slotRicevimento.delete({ where: { id_slot: idSlot } });
}

export async function getStatistiche(idDocente: string) {
  const prenotazioni = await prisma.prenotazione.findMany({
    where: { slot: { id_docente: idDocente } },
    select: { argomento: true },
  });

  const conteggio: Record<string, number> = {};
  for (const p of prenotazioni) {
    conteggio[p.argomento] = (conteggio[p.argomento] || 0) + 1;
  }

  const argomenti = Object.entries(conteggio).map(([nome, conteggio]) => ({
    nome,
    conteggio,
  }));

  return { argomenti };
}
