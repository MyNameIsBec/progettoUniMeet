import { prisma } from '../prisma/client';

export async function getProfilo(matricola: string) {
  const studente = await prisma.studente.findUnique({
    where: { matricola },
    include: {
      corso_di_studi: { select: { id_corso_di_studi: true, nome: true } },
    },
  });
  if (!studente) throw new Error('Studente not found');
  return {
    id: studente.matricola,
    matricola: studente.matricola,
    nome: studente.nome,
    cognome: studente.cognome,
    email: studente.email,
    corsoDiStudi: studente.corso_di_studi.nome,
    corsoDiStudiId: studente.corso_di_studi.id_corso_di_studi,
    notificheApp: studente.notifiche_app,
    notificheEmail: studente.notifiche_email,
    reminderOre: studente.reminder_ore,
    tema: studente.tema,
    lingua: studente.lingua,
  };
}

export async function aggiornaProfilo(matricola: string, data: {
  nome?: string;
  cognome?: string;
  email?: string;
  notificheApp?: boolean;
  notificheEmail?: boolean;
  reminderOre?: number;
  tema?: string;
  lingua?: string;
}) {
  const existing = await prisma.studente.findUnique({ where: { matricola } });
  if (!existing) throw new Error('Studente not found');

  const updateData: any = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.cognome !== undefined) updateData.cognome = data.cognome;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.notificheApp !== undefined) updateData.notifiche_app = data.notificheApp;
  if (data.notificheEmail !== undefined) updateData.notifiche_email = data.notificheEmail;
  if (data.reminderOre !== undefined) updateData.reminder_ore = data.reminderOre;
  if (data.tema !== undefined) updateData.tema = data.tema;
  if (data.lingua !== undefined) updateData.lingua = data.lingua;

  await prisma.studente.update({ where: { matricola }, data: updateData });
  return { messaggio: 'Profilo aggiornato con successo.' };
}

export async function eliminaAccount(matricola: string) {
  const existing = await prisma.studente.findUnique({ where: { matricola } });
  if (!existing) throw new Error('Studente not found');
  await prisma.$transaction(async (tx) => {
    await tx.documento.deleteMany({ where: { prenotazione: { matricola_studente: matricola } } });
    await tx.prenotazione.deleteMany({ where: { matricola_studente: matricola } });
    await tx.segnalazione.deleteMany({ where: { matricola_studente: matricola } });
    await tx.notifica.deleteMany({ where: { destinatario_id: matricola } });
    await tx.studente.delete({ where: { matricola } });
  });
  return { messaggio: 'Account eliminato con successo.' };
}
