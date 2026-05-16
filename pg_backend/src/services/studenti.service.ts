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
  };
}

export async function aggiornaProfilo(matricola: string, data: {
  nome?: string;
  cognome?: string;
  email?: string;
  corsoDiStudiId?: string;
}) {
  const existing = await prisma.studente.findUnique({ where: { matricola } });
  if (!existing) throw new Error('Studente not found');

  const updateData: any = {};
  if (data.nome) updateData.nome = data.nome;
  if (data.cognome) updateData.cognome = data.cognome;
  if (data.email) updateData.email = data.email;
  if (data.corsoDiStudiId) updateData.id_corso_di_studi = data.corsoDiStudiId;

  await prisma.studente.update({ where: { matricola }, data: updateData });
  return { messaggio: 'Profilo aggiornato con successo.' };
}
