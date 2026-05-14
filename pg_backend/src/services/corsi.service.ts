import { prisma } from '../prisma/client';

export interface CorsoResponse {
  id: string;
  nomeCorso: string;
  anno: number;
  cfu: number;
  idDocente: string;
  docente: {
    id: string;
    nome: string;
    cognome: string;
    email: string;
  } | undefined;
}

function mapCorso(corso: any): CorsoResponse {
  return {
    id: corso.id_corso,
    nomeCorso: corso.nome_corso,
    anno: corso.anno,
    cfu: corso.cfu,
    idDocente: corso.id_docente,
    docente: corso.docente
      ? {
          id: corso.docente.id_docente,
          nome: corso.docente.nome,
          cognome: corso.docente.cognome,
          email: corso.docente.email,
        }
      : undefined,
  };
}

export async function getCorsi(docenteId?: string): Promise<CorsoResponse[]> {
  const where: any = {};
  if (docenteId) where.id_docente = docenteId;

  const corsi = await prisma.corso.findMany({
    where,
    include: {
      docente: { select: { id_docente: true, nome: true, cognome: true, email: true } },
    },
    orderBy: { nome_corso: 'asc' },
  });

  return corsi.map(mapCorso);
}

export async function getCorsoById(id: string): Promise<CorsoResponse> {
  const corso = await prisma.corso.findUnique({
    where: { id_corso: id },
    include: {
      docente: { select: { id_docente: true, nome: true, cognome: true, email: true } },
    },
  });
  if (!corso) throw new Error('Corso not found');
  return mapCorso(corso);
}

export async function createCorso(data: {
  nomeCorso: string;
  anno: number;
  cfu: number;
  idDocente: string;
}): Promise<CorsoResponse> {
  const corso = await prisma.corso.create({
    data: {
      nome_corso: data.nomeCorso,
      anno: data.anno,
      cfu: data.cfu,
      id_docente: data.idDocente,
    },
    include: {
      docente: { select: { id_docente: true, nome: true, cognome: true, email: true } },
    },
  });
  return mapCorso(corso);
}

export async function updateCorso(id: string, data: {
  nomeCorso?: string;
  anno?: number;
  cfu?: number;
  idDocente?: string;
}): Promise<CorsoResponse> {
  const existing = await prisma.corso.findUnique({ where: { id_corso: id } });
  if (!existing) throw new Error('Corso not found');

  const updateData: any = {};
  if (data.nomeCorso !== undefined) updateData.nome_corso = data.nomeCorso;
  if (data.anno !== undefined) updateData.anno = data.anno;
  if (data.cfu !== undefined) updateData.cfu = data.cfu;
  if (data.idDocente !== undefined) updateData.id_docente = data.idDocente;

  const corso = await prisma.corso.update({
    where: { id_corso: id },
    data: updateData,
    include: {
      docente: { select: { id_docente: true, nome: true, cognome: true, email: true } },
    },
  });
  return mapCorso(corso);
}

export async function deleteCorso(id: string): Promise<void> {
  const corso = await prisma.corso.findUnique({ where: { id_corso: id } });
  if (!corso) throw new Error('Corso not found');

  await prisma.fAQ.deleteMany({ where: { bacheca: { id_corso: id } } });
  await prisma.bacheca.deleteMany({ where: { id_corso: id } });
  await prisma.corso.delete({ where: { id_corso: id } });
}
