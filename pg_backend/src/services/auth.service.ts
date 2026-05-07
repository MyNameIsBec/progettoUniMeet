import { prisma } from '../prisma/client';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function createStudente(data: {
  matricola: string;
  nome: string;
  cognome: string;
  email: string;
  password: string;
  corso_di_studi: string;
}) {
  const existing = await prisma.studente.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already in use');

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  return prisma.studente.create({
    data: { ...data, password: hashedPassword },
    select: {
      matricola: true,
      nome: true,
      cognome: true,
      email: true,
      corso_di_studi: true,
    },
  });
}

export async function createDocente(data: {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  ufficio: string;
}) {
  const existing = await prisma.docente.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already in use');

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  return prisma.docente.create({
    data: { ...data, password: hashedPassword },
    select: {
      id_docente: true,
      nome: true,
      cognome: true,
      email: true,
      ufficio: true,
    },
  });
}
