import { prisma } from '../prisma/client';

export async function getAll() {
  return prisma.corsoDiStudi.findMany({
    orderBy: { nome: 'asc' },
    select: { id_corso_di_studi: true, nome: true },
  });
}
