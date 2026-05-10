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
  const [totaleStudenti, totaleDocenti, totalePrenotazioni, slotAttivi, prenotazioniOggi] =
    await Promise.all([
      prisma.studente.count(),
      prisma.docente.count(),
      prisma.prenotazione.count(),
      prisma.slotRicevimento.count({ where: { disponibilita: true } }),
      prisma.prenotazione.count({
        where: {
          data_prenotazione: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
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
    const studenti = await prisma.studente.findMany();
    for (const s of studenti) {
      results.push({
        id: s.matricola, ruolo: 'studente', nome: s.nome, cognome: s.cognome,
        email: s.email, matricola: s.matricola, corsoDiStudi: s.corso_di_studi,
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

    const user = await prisma.studente.create({
      data: {
        matricola: data.matricola,
        nome: data.nome,
        cognome: data.cognome,
        email: data.email,
        password: hashedPassword,
        corso_di_studi: data.corsoDiStudi,
      },
    });
    return {
      id: user.matricola, ruolo: 'studente', nome: user.nome, cognome: user.cognome,
      email: user.email, matricola: user.matricola, corsoDiStudi: user.corso_di_studi,
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
    if (data.corsoDiStudi) updateData.corso_di_studi = data.corsoDiStudi;
    const user = await prisma.studente.update({ where: { matricola: id }, data: updateData });
    return {
      id: user.matricola, ruolo: 'studente', nome: user.nome, cognome: user.cognome,
      email: user.email, matricola: user.matricola, corsoDiStudi: user.corso_di_studi,
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

export async function deleteUser(id: string): Promise<void> {
  const found = await trovaUtentePerId(id);
  if (!found) throw new Error('User not found');

  if (found.tabella === 'studente') {
    await prisma.prenotazione.deleteMany({ where: { matricola_studente: id } });
    await prisma.studente.delete({ where: { matricola: id } });
  } else if (found.tabella === 'docente') {
    await prisma.docente.delete({ where: { id_docente: id } });
  } else {
    await prisma.amministratore.delete({ where: { id_admin: id } });
  }
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
