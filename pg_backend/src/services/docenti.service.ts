import { prisma } from '../prisma/client';
import { formatTime } from '../utils/time';
async function notifica(destinatarioId: string, destinatarioRuolo: string, titolo: string, messaggio: string, tipo: string) {
  await prisma.notifica.create({
    data: { titolo, messaggio, tipo, destinatario_id: destinatarioId, destinatario_ruolo: destinatarioRuolo },
  });
}
function getCorsoDiStudiIds(d: any): string[] {
  return d.corsi_di_studi?.map((cds: any) => cds.corso_di_studi.nome) ?? [];
}
export async function getElencoDocenti(filtri?: { corso?: string; search?: string; corsoId?: string }) {
  const where: any = {};
  if (filtri?.corsoId) {
    where.corsi_di_studi = {
      some: {
        corso_di_studi: { id_corso_di_studi: filtri.corsoId },
      },
    };
  } else if (filtri?.corso && filtri.corso !== 'tutti') {
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
      corsi: { select: { id_corso: true, nome_corso: true } },
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
    corsi: d.corsi?.map(c => ({ id: c.id_corso, nome: c.nome_corso })) ?? [],
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
    materia: docente.corsi?.[0]?.nome_corso ?? 'N/D',
    corsi: docente.corsi?.map(c => ({
      id: c.id_corso,
      nome: c.nome_corso,
      cfu: c.cfu,
      anno: c.anno
    })) ?? [],
    corsoDiStudi: docente.corsi_di_studi?.map(cds => cds.corso_di_studi.nome) ?? [],
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
    const start = new Date(Date.UTC(anno, m, 1));
    const end = new Date(Date.UTC(anno, m + 1, 0, 23, 59, 59));
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
  return slots.map((s) => ({
    id: s.id_slot,
    docenteId: s.id_docente,
    data: s.data.toISOString().split('T')[0],
    oraInizio: formatTime(s.ora_inizio),
    oraFine: formatTime(s.ora_fine),
    disponibilita: s.disponibilita,
    stato: s.disponibilita ? 'disponibile' : 'occupato',
    luogo: s.luogo
      ? {
          id: s.luogo.id_luogo,
          aula: s.luogo.nome_aula,
          edificio: s.luogo.edificio,
          piano: s.luogo.piano,
          latitudine: s.luogo.latitudine,
          longitudine: s.luogo.longitudine,
        }
      : undefined,
    prenotazioniCount: s.prenotazioni.length,
  }));
}
export async function creaSlot(idDocente: string, data: {
  data: string;
  oraInizio: string;
  oraFine: string;
  luogo?: { nomeAula: string; edificio: string; piano: string; latitudine?: number; longitudine?: number };
}) {
  const dataSlot = new Date(data.data + 'T00:00:00Z');
  const startLocal = new Date(`${data.data}T${data.oraInizio}:00.000Z`);
  if (startLocal <= new Date()) throw new Error('Non puoi creare uno slot per un orario passato');
  const giornoSettimana = new Date(data.data + 'T00:00:00Z').getUTCDay();
  if (giornoSettimana === 0 || giornoSettimana === 6) throw new Error('Non puoi creare slot di sabato o domenica');
  const giornoBloccato = await prisma.giornoBloccato.findUnique({
    where: { data: dataSlot },
  });
  if (giornoBloccato) throw new Error('Giorno bloccato');
  const startStr = `${data.data}T${data.oraInizio}:00.000Z`;
  const endStr = `${data.data}T${data.oraFine}:00.000Z`;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (end <= start) throw new Error("L'ora di fine deve essere successiva all'ora di inizio");
  const diffMs = end.getTime() - start.getTime();
  const diffMin = diffMs / (1000 * 60);
  if (diffMin > 60) {
    throw new Error('La durata dello slot non può superare 1 ora.');
  }
  const slot = await prisma.$transaction(async (tx) => {
    const overlap = await tx.slotRicevimento.findFirst({
      where: {
        id_docente: idDocente,
        data: dataSlot,
        OR: [
          { ora_inizio: { lt: end }, ora_fine: { gt: start } },
        ],
      },
    });
    if (overlap) {
      throw new Error('Slot già esistente in questa fascia oraria');
    }
    return await tx.slotRicevimento.create({
      data: {
        data: dataSlot,
        ora_inizio: start,
        ora_fine: end,
        id_docente: idDocente,
        ...(!data.luogo ? {} : {
          luogo: {
            create: {
              nome_aula: data.luogo.nomeAula,
              edificio: data.luogo.edificio,
              piano: data.luogo.piano,
              ...(data.luogo.latitudine != null ? { latitudine: data.luogo.latitudine } : {}),
              ...(data.luogo.longitudine != null ? { longitudine: data.luogo.longitudine } : {}),
            },
          },
        }),
      },
      include: { luogo: true },
    });
  });
  await notifica(
    idDocente, 'DOCENTE',
    'Slot creato con successo',
    `Slot di ricevimento creato per il ${data.data} dalle ${data.oraInizio} alle ${data.oraFine}.`,
    'slot_creato'
  );
  return {
    id: slot.id_slot,
    docenteId: slot.id_docente,
    data: slot.data.toISOString().split('T')[0],
    oraInizio: formatTime(slot.ora_inizio),
    oraFine: formatTime(slot.ora_fine),
    disponibilita: slot.disponibilita,
    luogo: slot.luogo
      ? { id: slot.luogo.id_luogo, aula: slot.luogo.nome_aula, edificio: slot.luogo.edificio, piano: slot.luogo.piano }
      : undefined,
  };
}
export async function modificaSlot(idDocente: string, idSlot: string, data: any) {
  if (data.data && data.oraInizio) {
    const startLocal = new Date(`${data.data}T${data.oraInizio}:00.000Z`);
    if (startLocal <= new Date()) throw new Error('Non puoi modificare uno slot per un orario passato');
    const giornoSettimana = new Date(data.data + 'T00:00:00Z').getUTCDay();
    if (giornoSettimana === 0 || giornoSettimana === 6) throw new Error('Non puoi creare slot di sabato o domenica');
  }
  const row = await prisma.slotRicevimento.findFirst({
    where: { id_slot: idSlot, id_docente: idDocente },
    include: { luogo: true },
  });
  if (!row) throw new Error('Slot not found');
  const updateData: any = {};
  const baseDate = data.data ? data.data : row.data.toISOString().split('T')[0];
  if (data.data) updateData.data = new Date(data.data + 'T00:00:00Z');
  if (data.oraInizio) updateData.ora_inizio = new Date(`${baseDate}T${data.oraInizio}:00.000Z`);
  if (data.oraFine) updateData.ora_fine = new Date(`${baseDate}T${data.oraFine}:00.000Z`);
    if (data.disponibilita !== undefined) updateData.disponibilita = data.disponibilita;
  await prisma.$transaction(async (tx) => {
    if (Object.keys(updateData).length > 0) {
      await tx.slotRicevimento.update({
        where: { id_slot: idSlot },
        data: updateData,
      });
    }
    if (data.luogo) {
      const luogoData: any = {
        nome_aula: data.luogo.nomeAula,
        edificio: data.luogo.edificio,
        piano: data.luogo.piano,
      };
      if (data.luogo.latitudine != null) luogoData.latitudine = data.luogo.latitudine;
      if (data.luogo.longitudine != null) luogoData.longitudine = data.luogo.longitudine;
      if (row.luogo) {
        await tx.luogoRicevimento.update({
          where: { id_luogo: row.luogo.id_luogo },
          data: luogoData,
        });
      } else {
        await tx.luogoRicevimento.create({
          data: { ...luogoData, id_slot: idSlot },
        });
      }
    }
  });
  return { messaggio: 'Slot aggiornato con successo.' };
}
export async function eliminaSlot(idDocente: string, idSlot: string, motivazione?: string) {
  const slot = await prisma.slotRicevimento.findFirst({
    where: { id_slot: idSlot, id_docente: idDocente },
  });
  if (!slot) throw new Error('Slot not found');
  const dataSlot = slot.data.toISOString().split('T')[0];
  const msg = motivazione
    ? `Slot del ${dataSlot} eliminato. Motivo: ${motivazione}`
    : `Slot del ${dataSlot} eliminato.`;
  const prenotazioni = await prisma.prenotazione.findMany({
    where: { id_slot: idSlot },
    include: { studente: { select: { matricola: true, nome: true, cognome: true, notifiche_app: true } } },
  });
  await notifica(idDocente, 'DOCENTE', 'Slot eliminato', msg, 'slot_eliminato');
  for (const p of prenotazioni) {
    if (p.studente.notifiche_app) {
      await prisma.notifica.create({
        data: {
          titolo: 'Slot eliminato',
          messaggio: `Lo slot del ${dataSlot} è stato eliminato dal docente. La tua prenotazione è stata cancellata.`,
          tipo: 'slot_eliminato',
          destinatario_id: p.studente.matricola,
          destinatario_ruolo: 'STUDENTE',
        },
      });
    }
  }
  await prisma.$transaction(async (tx) => {
    await tx.documento.deleteMany({ where: { prenotazione: { id_slot: idSlot } } });
    await tx.luogoRicevimento.deleteMany({ where: { id_slot: idSlot } });
    await tx.prenotazione.deleteMany({ where: { id_slot: idSlot } });
    await tx.slotRicevimento.delete({ where: { id_slot: idSlot } });
  });
}
export async function aggiornaProfilo(idDocente: string, data: {
  nome?: string;
  cognome?: string;
  email?: string;
  ufficio?: string;
  notificheApp?: boolean;
  notificheEmail?: boolean;
  reminderOre?: number;
  tema?: string;
  lingua?: string;
}) {
  const existing = await prisma.docente.findUnique({ where: { id_docente: idDocente } });
  if (!existing) throw new Error('Docente not found');
  const updateData: any = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.cognome !== undefined) updateData.cognome = data.cognome;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.ufficio !== undefined) updateData.ufficio = data.ufficio;
  if (data.notificheApp !== undefined) updateData.notifiche_app = data.notificheApp;
  if (data.notificheEmail !== undefined) updateData.notifiche_email = data.notificheEmail;
  if (data.reminderOre !== undefined) updateData.reminder_ore = data.reminderOre;
  if (data.tema !== undefined) updateData.tema = data.tema;
  if (data.lingua !== undefined) updateData.lingua = data.lingua;
  await prisma.docente.update({ where: { id_docente: idDocente }, data: updateData });
  return { messaggio: 'Profilo aggiornato con successo.' };
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
