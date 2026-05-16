import { prisma } from '../prisma/client';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export interface AdminStats {
  totaleStudenti: number;
  totaleDocenti: number;
  totalePrenotazioni: number;
  slotAttivi: number;
  prenotazioniOggi: number;
}

export interface UtenteUnificato {
  id: string;
  ruolo: string;
  nome: string;
  cognome: string;
  email: string;
  matricola?: string;
  corsoDiStudi?: string;
  ufficio?: string;
}

export interface SlotGriglia {
  id: string;
  docente: { id: string; nome: string; cognome: string; email: string };
  data: string;
  oraInizio: string;
  oraFine: string;
  disponibilita: boolean;
  luogo?: { nomeAula: string; edificio: string; piano: string } | null;
  prenotazioniCount: number;
}

export async function getStats(): Promise<AdminStats> {
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  const domani = new Date(oggi);
  domani.setDate(domani.getDate() + 1);

  const [totaleStudenti, totaleDocenti, totalePrenotazioni, slotAttivi, prenotazioniOggi] =
    await Promise.all([
      prisma.studente.count(),
      prisma.docente.count(),
      prisma.prenotazione.count(),
      prisma.slotRicevimento.count(),
      prisma.prenotazione.count({
        where: {
          slot: {
            data: {
              gte: oggi,
              lt: domani,
            },
          },
        },
      }),
    ]);

  return { totaleStudenti, totaleDocenti, totalePrenotazioni, slotAttivi, prenotazioniOggi };
}

async function trovaUtentePerId(id: string): Promise<{ tabella: string; dati: any } | null> {
  let user: any = await prisma.studente.findUnique({ where: { matricola: id } });
  if (user) return { tabella: 'studente', dati: user };

  user = await prisma.docente.findUnique({ where: { id_docente: id } });
  if (user) return { tabella: 'docente', dati: user };

  const admin = await prisma.amministratore.findUnique({ where: { id_admin: id } });
  if (admin) return { tabella: 'amministratore', dati: admin };

  return null;
}

export async function getAllUsers(ruolo?: string): Promise<UtenteUnificato[]> {
  const results: UtenteUnificato[] = [];

  if (!ruolo || ruolo === 'studente') {
    const studenti = await prisma.studente.findMany({
      include: { corso_di_studi: { select: { nome: true } } },
    });
    for (const s of studenti) {
      results.push({
        id: s.matricola, ruolo: 'studente', nome: s.nome, cognome: s.cognome,
        email: s.email, matricola: s.matricola, corsoDiStudi: s.corso_di_studi.nome,
      });
    }
  }

  if (!ruolo || ruolo === 'docente') {
    const docenti = await prisma.docente.findMany();
    for (const d of docenti) {
      results.push({
        id: d.id_docente, ruolo: 'docente', nome: d.nome, cognome: d.cognome,
        email: d.email, ufficio: d.ufficio,
      });
    }
  }

  if (!ruolo || ruolo === 'amministratore') {
    const admin = await prisma.amministratore.findMany();
    for (const a of admin) {
      results.push({
        id: a.id_admin, ruolo: 'amministratore', nome: a.nome, cognome: '',
        email: a.email,
      });
    }
  }

  return results;
}

export async function createUser(data: any): Promise<UtenteUnificato> {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  if (data.ruolo === 'studente') {
    const existing = await prisma.studente.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('Email already in use');

    let cdsId = data.corsoDiStudi ?? data.corsoDiStudiId;
    if (cdsId) {
      const cds = await prisma.corsoDiStudi.findUnique({ where: { id_corso_di_studi: cdsId } })
        ?? await prisma.corsoDiStudi.findUnique({ where: { nome: cdsId } });
      if (cds) cdsId = cds.id_corso_di_studi;
    }

    const user = await prisma.studente.create({
      data: {
        matricola: data.matricola,
        nome: data.nome,
        cognome: data.cognome,
        email: data.email,
        password: hashedPassword,
        id_corso_di_studi: cdsId ?? 'cds-1',
      },
      include: { corso_di_studi: { select: { nome: true } } },
    });
    return {
      id: user.matricola, ruolo: 'studente', nome: user.nome, cognome: user.cognome,
      email: user.email, matricola: user.matricola, corsoDiStudi: user.corso_di_studi.nome,
    };
  }

  if (data.ruolo === 'docente') {
    const existing = await prisma.docente.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('Email already in use');

    const user = await prisma.docente.create({
      data: {
        nome: data.nome, cognome: data.cognome, email: data.email,
        password: hashedPassword, ufficio: data.ufficio,
      },
    });
    return {
      id: user.id_docente, ruolo: 'docente', nome: user.nome, cognome: user.cognome,
      email: user.email, ufficio: user.ufficio,
    };
  }

  const existing = await prisma.amministratore.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already in use');

  const user = await prisma.amministratore.create({
    data: { nome: data.nome, email: data.email, password: hashedPassword },
  });
  return {
    id: user.id_admin, ruolo: 'amministratore', nome: user.nome, cognome: '',
    email: user.email,
  };
}

export async function updateUser(id: string, data: any): Promise<UtenteUnificato> {
  const found = await trovaUtentePerId(id);
  if (!found) throw new Error('User not found');

  const updateData: any = {};
  if (data.nome) updateData.nome = data.nome;
  if (data.email) updateData.email = data.email;
  if (data.password) updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);

  if (found.tabella === 'studente') {
    if (data.cognome) updateData.cognome = data.cognome;
    if (data.matricola) updateData.matricola = data.matricola;
    const cdsId = data.corsoDiStudi ?? data.corsoDiStudiId;
    if (cdsId) {
      const cds = await prisma.corsoDiStudi.findUnique({ where: { id_corso_di_studi: cdsId } })
        ?? await prisma.corsoDiStudi.findUnique({ where: { nome: cdsId } });
      if (cds) updateData.id_corso_di_studi = cds.id_corso_di_studi;
    }
    const user = await prisma.studente.update({
      where: { matricola: id },
      data: updateData,
      include: { corso_di_studi: { select: { nome: true } } },
    });
    return {
      id: user.matricola, ruolo: 'studente', nome: user.nome, cognome: user.cognome,
      email: user.email, matricola: user.matricola, corsoDiStudi: user.corso_di_studi.nome,
    };
  }

  if (found.tabella === 'docente') {
    if (data.cognome) updateData.cognome = data.cognome;
    if (data.ufficio) updateData.ufficio = data.ufficio;
    const user = await prisma.docente.update({ where: { id_docente: id }, data: updateData });
    return {
      id: user.id_docente, ruolo: 'docente', nome: user.nome, cognome: user.cognome,
      email: user.email, ufficio: user.ufficio,
    };
  }

  const user = await prisma.amministratore.update({ where: { id_admin: id }, data: updateData });
  return {
    id: user.id_admin, ruolo: 'amministratore', nome: user.nome, cognome: '',
    email: user.email,
  };
}

export async function deleteUser(id: string, adminId?: string): Promise<void> {
  const found = await trovaUtentePerId(id);
  if (!found) throw new Error('User not found');

  if (adminId && found.tabella === 'amministratore' && (found.dati as any).id_admin === adminId) {
    throw new Error('Cannot delete your own account');
  }

  await prisma.$transaction(async (tx) => {
    if (found.tabella === 'studente') {
      await tx.documento.deleteMany({
        where: { prenotazione: { matricola_studente: id } },
      });
      await tx.prenotazione.deleteMany({ where: { matricola_studente: id } });
      await tx.segnalazione.deleteMany({ where: { matricola_studente: id } });
      await tx.notifica.deleteMany({ where: { destinatario_id: id } });
      await tx.studente.delete({ where: { matricola: id } });
    } else if (found.tabella === 'docente') {
      await tx.docenteCorsoDiStudi.deleteMany({ where: { id_docente: id } });
      await tx.corso.deleteMany({ where: { id_docente: id } });

      const slotIds = (await tx.slotRicevimento.findMany({
        where: { id_docente: id },
        select: { id_slot: true },
      })).map(s => s.id_slot);

      if (slotIds.length > 0) {
        await tx.documento.deleteMany({
          where: { prenotazione: { id_slot: { in: slotIds } } },
        });
        await tx.prenotazione.deleteMany({ where: { id_slot: { in: slotIds } } });
        await tx.luogoRicevimento.deleteMany({ where: { id_slot: { in: slotIds } } });
        await tx.slotRicevimento.deleteMany({ where: { id_docente: id } });
      }

      await tx.notifica.deleteMany({ where: { destinatario_id: id } });
      await tx.docente.delete({ where: { id_docente: id } });
    } else {
      await tx.notifica.deleteMany({ where: { destinatario_id: id } });
      await tx.amministratore.delete({ where: { id_admin: id } });
    }
  });
}

export interface SlotDate {
  data: string;
  conteggio: number;
}

export async function getSlotDate(): Promise<SlotDate[]> {
  const result = await prisma.slotRicevimento.groupBy({
    by: ['data'],
    _count: { id_slot: true },
    orderBy: { data: 'asc' },
  });

  return result.map((r) => ({
    data: r.data.toISOString().split('T')[0] ?? '',
    conteggio: r._count.id_slot,
  }));
}

export interface CreaSlotRequest {
  docenteId: string;
  data: string;
  oraInizio: string;
  oraFine: string;
  disponibilita?: boolean;
  luogo?: { nomeAula: string; edificio: string; piano: string } | null;
}

export async function creaSlot(data: CreaSlotRequest): Promise<SlotGriglia> {
  const slot = await prisma.slotRicevimento.create({
    data: {
      data: new Date(data.data),
      ora_inizio: data.oraInizio as any,
      ora_fine: data.oraFine as any,
      disponibilita: data.disponibilita ?? true,
      id_docente: data.docenteId,
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
    include: {
      docente: { select: { id_docente: true, nome: true, cognome: true, email: true } },
      luogo: { select: { nome_aula: true, edificio: true, piano: true } },
    },
  });

  const fmtDate = (d: Date) => d.toISOString().split('T')[0] ?? '';
  const fmtTime = (d: Date) => (d.toISOString().split('T')[1] ?? '').substring(0, 5);

  return {
    id: slot.id_slot,
    docente: {
      id: slot.docente.id_docente, nome: slot.docente.nome,
      cognome: slot.docente.cognome, email: slot.docente.email,
    },
    data: fmtDate(slot.data),
    oraInizio: fmtTime(slot.ora_inizio),
    oraFine: fmtTime(slot.ora_fine),
    disponibilita: slot.disponibilita,
    luogo: slot.luogo
      ? { nomeAula: slot.luogo.nome_aula, edificio: slot.luogo.edificio, piano: slot.luogo.piano }
      : null,
    prenotazioniCount: 0,
  };
}

export async function modificaSlot(idSlot: string, data: any): Promise<void> {
  const row = await prisma.slotRicevimento.findUnique({
    where: { id_slot: idSlot },
    include: { luogo: true },
  });
  if (!row) throw new Error('Slot not found');

  const updateData: any = {};
  if (data.data) updateData.data = new Date(data.data);
  if (data.oraInizio) updateData.ora_inizio = data.oraInizio as any;
  if (data.oraFine) updateData.ora_fine = data.oraFine as any;
  if (data.disponibilita !== undefined) updateData.disponibilita = data.disponibilita;
  if (data.docenteId) updateData.id_docente = data.docenteId;

  if (Object.keys(updateData).length > 0) {
    await prisma.slotRicevimento.update({
      where: { id_slot: idSlot },
      data: updateData,
    });
  }

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
}

export async function eliminaSlot(idSlot: string): Promise<void> {
  const slot = await prisma.slotRicevimento.findUnique({
    where: { id_slot: idSlot },
  });
  if (!slot) throw new Error('Slot not found');

  await prisma.luogoRicevimento.deleteMany({ where: { id_slot: idSlot } });
  await prisma.prenotazione.deleteMany({ where: { id_slot: idSlot } });
  await prisma.slotRicevimento.delete({ where: { id_slot: idSlot } });
}

export interface GiornoBloccato {
  id: string;
  data: string;
  motivo: string;
  creatoIl: Date;
}

export async function getGiorniBloccati(): Promise<GiornoBloccato[]> {
  const rows = await prisma.giornoBloccato.findMany({
    orderBy: { data: 'asc' },
  });
  return rows.map((r) => ({
    id: r.id_giorno,
    data: r.data.toISOString().split('T')[0] ?? '',
    motivo: r.motivo,
    creatoIl: r.creato_il,
  }));
}

export async function bloccaGiorno(data: string, motivo?: string): Promise<GiornoBloccato> {
  const existing = await prisma.giornoBloccato.findUnique({
    where: { data: new Date(data) },
  });
  if (existing) throw new Error('Giorno già bloccato');

  const row = await prisma.giornoBloccato.create({
    data: { data: new Date(data), motivo: motivo ?? 'Festivo' },
  });
  return {
    id: row.id_giorno,
    data: row.data.toISOString().split('T')[0] ?? '',
    motivo: row.motivo,
    creatoIl: row.creato_il,
  };
}

export async function sbloccaGiorno(id: string): Promise<void> {
  const row = await prisma.giornoBloccato.findUnique({ where: { id_giorno: id } });
  if (!row) throw new Error('Giorno non trovato');
  await prisma.giornoBloccato.delete({ where: { id_giorno: id } });
}

export async function getSlotGlobali(filtri?: {
  docenteId?: string;
  data?: string;
  stato?: string;
}): Promise<SlotGriglia[]> {
  const where: any = {};

  if (filtri?.docenteId) where.id_docente = filtri.docenteId;
  if (filtri?.data) where.data = new Date(filtri.data);
  if (filtri?.stato === 'libero') where.disponibilita = true;
  if (filtri?.stato === 'occupato') where.disponibilita = false;

  const slot = await prisma.slotRicevimento.findMany({
    where,
    include: {
      docente: { select: { id_docente: true, nome: true, cognome: true, email: true } },
      luogo: { select: { nome_aula: true, edificio: true, piano: true } },
      prenotazioni: { select: { id_prenotazione: true } },
    },
    orderBy: [{ data: 'asc' }, { ora_inizio: 'asc' }],
  });

  return slot.map((s) => {
    const fmtDate = (d: Date) => {
      const iso = d.toISOString();
      return iso.split('T')[0] ?? '';
    };
    const fmtTime = (d: Date) => {
      const iso = d.toISOString();
      return (iso.split('T')[1] ?? '').substring(0, 5);
    };
    return {
      id: s.id_slot,
      docente: {
        id: s.docente.id_docente, nome: s.docente.nome,
        cognome: s.docente.cognome, email: s.docente.email,
      },
      data: fmtDate(s.data),
      oraInizio: fmtTime(s.ora_inizio),
      oraFine: fmtTime(s.ora_fine),
      disponibilita: s.disponibilita,
      luogo: s.luogo
        ? { nomeAula: s.luogo.nome_aula, edificio: s.luogo.edificio, piano: s.luogo.piano }
        : null,
      prenotazioniCount: s.prenotazioni.length,
    };
  });
}
