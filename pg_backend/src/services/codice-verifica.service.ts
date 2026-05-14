import { prisma } from '../prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export function generaCodice(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function creaCodice(email: string, tipo: string = 'reset_password'): Promise<string> {
  await invalidaPrecedenti(email, tipo);

  const codice = generaCodice();
  const hash = await bcrypt.hash(codice, 6);
  const scadenza = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.codiceVerifica.create({
    data: { email, codice: hash, tipo, scadenza },
  });

  return codice;
}

export async function verificaCodice(
  email: string,
  codice: string,
  tipo: string = 'reset_password',
): Promise<boolean> {
  const records = await prisma.codiceVerifica.findMany({
    where: {
      email,
      tipo,
      usato: false,
      scadenza: { gte: new Date() },
    },
    orderBy: { creato_il: 'desc' },
  });

  for (const record of records) {
    const match = await bcrypt.compare(codice, record.codice);
    if (match) return true;
  }

  return false;
}

export async function consumaCodice(
  email: string,
  codice: string,
  tipo: string = 'reset_password',
): Promise<boolean> {
  const records = await prisma.codiceVerifica.findMany({
    where: {
      email,
      tipo,
      usato: false,
      scadenza: { gte: new Date() },
    },
    orderBy: { creato_il: 'desc' },
  });

  for (const record of records) {
    const match = await bcrypt.compare(codice, record.codice);
    if (match) {
      await prisma.codiceVerifica.update({
        where: { id: record.id },
        data: { usato: true },
      });
      return true;
    }
  }

  return false;
}

async function invalidaPrecedenti(email: string, tipo: string): Promise<void> {
  await prisma.codiceVerifica.updateMany({
    where: { email, tipo, usato: false },
    data: { usato: true },
  });
}
