import { prisma } from '../prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? JWT_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

export type Ruolo = 'STUDENTE' | 'DOCENTE' | 'AMMINISTRATORE';

export interface LoginResponse {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  role: Ruolo;
  token: string;
}

export interface ProfileResponse {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  role: Ruolo;
  matricola?: string;
  corsoDiStudi?: string;
  ufficio?: string;
}

function generateTokens(payload: { id: string; email: string; ruolo: Ruolo }) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as any });
  return { accessToken, refreshToken };
}

export async function createStudente(data: {
  matricola: string;
  nome: string;
  cognome: string;
  email: string;
  password: string;
  corsoDiStudi: string;
}): Promise<LoginResponse> {
  const existing = await prisma.studente.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already in use');

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  await prisma.studente.create({
    data: {
      matricola: data.matricola,
      nome: data.nome,
      cognome: data.cognome,
      email: data.email,
      password: hashedPassword,
      corso_di_studi: data.corsoDiStudi,
    },
  });

  const { accessToken } = generateTokens({ id: data.matricola, email: data.email, ruolo: 'STUDENTE' });

  return {
    id: data.matricola,
    nome: data.nome,
    cognome: data.cognome,
    email: data.email,
    role: 'STUDENTE',
    token: accessToken,
  };
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

export async function registerAdmin(data: {
  nome: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.amministratore.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already in use');

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  return prisma.amministratore.create({
    data: { ...data, password: hashedPassword },
    select: { id_admin: true, nome: true, email: true },
  });
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  let user: any = await prisma.studente.findUnique({ where: { email } });
  let ruolo: Ruolo = 'STUDENTE';

  if (!user) {
    user = await prisma.docente.findUnique({ where: { email } });
    ruolo = 'DOCENTE';
  }

  if (!user) {
    user = await prisma.amministratore.findUnique({ where: { email } });
    ruolo = 'AMMINISTRATORE';
  }

  if (!user) throw new Error('Invalid email or password');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid email or password');

  const id = ruolo === 'STUDENTE' ? user.matricola : ruolo === 'DOCENTE' ? user.id_docente : user.id_admin;
  const cognome = ruolo === 'AMMINISTRATORE' ? '' : user.cognome;

  const { accessToken } = generateTokens({ id, email: user.email, ruolo });

  return {
    id,
    nome: user.nome,
    cognome,
    email: user.email,
    role: ruolo,
    token: accessToken,
  };
}

export async function getProfile(userId: string, ruolo: Ruolo): Promise<ProfileResponse> {
  if (ruolo === 'STUDENTE') {
    const user = await prisma.studente.findUnique({ where: { matricola: userId } });
    if (!user) throw new Error('User not found');
    return {
      id: user.matricola,
      nome: user.nome,
      cognome: user.cognome,
      email: user.email,
      role: 'STUDENTE',
      matricola: user.matricola,
      corsoDiStudi: user.corso_di_studi,
    };
  }

  if (ruolo === 'DOCENTE') {
    const user = await prisma.docente.findUnique({ where: { id_docente: userId } });
    if (!user) throw new Error('User not found');
    return {
      id: user.id_docente,
      nome: user.nome,
      cognome: user.cognome,
      email: user.email,
      role: 'DOCENTE',
      ufficio: user.ufficio,
    };
  }

  const user = await prisma.amministratore.findUnique({ where: { id_admin: userId } });
  if (!user) throw new Error('User not found');
  return {
    id: user.id_admin,
    nome: user.nome,
    cognome: '',
    email: user.email,
    role: 'AMMINISTRATORE',
  };
}

export async function refreshToken(token: string): Promise<{ token: string }> {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string; email: string; ruolo: Ruolo };
    const { accessToken } = generateTokens({ id: payload.id, email: payload.email, ruolo: payload.ruolo });
    return { token: accessToken };
  } catch {
    throw new Error('Invalid or expired refresh token');
  }
}

export async function changePassword(
  userId: string,
  ruolo: Ruolo,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  let user: any;

  if (ruolo === 'STUDENTE') {
    user = await prisma.studente.findUnique({ where: { matricola: userId } });
  } else if (ruolo === 'DOCENTE') {
    user = await prisma.docente.findUnique({ where: { id_docente: userId } });
  } else {
    user = await prisma.amministratore.findUnique({ where: { id_admin: userId } });
  }

  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) throw new Error('Wrong password');

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

  if (ruolo === 'STUDENTE') {
    await prisma.studente.update({ where: { matricola: userId }, data: { password: hashed } });
  } else if (ruolo === 'DOCENTE') {
    await prisma.docente.update({ where: { id_docente: userId }, data: { password: hashed } });
  } else {
    await prisma.amministratore.update({ where: { id_admin: userId }, data: { password: hashed } });
  }
}

export async function forgotPassword(email: string): Promise<{ messaggio: string }> {
  let user: any = await prisma.studente.findUnique({ where: { email } });
  let ruolo: Ruolo = 'STUDENTE';

  if (!user) {
    user = await prisma.docente.findUnique({ where: { email } });
    ruolo = 'DOCENTE';
  }
  if (!user) {
    user = await prisma.amministratore.findUnique({ where: { email } });
    ruolo = 'AMMINISTRATORE';
  }
  if (!user) throw new Error('User not found');

  const id = ruolo === 'STUDENTE' ? user.matricola : ruolo === 'DOCENTE' ? user.id_docente : user.id_admin;
  const resetToken = jwt.sign({ id, email, ruolo }, JWT_SECRET, { expiresIn: '15m' as any });

  return { messaggio: "Se l'email esiste, riceverai un link per il reset della password." };
}

export async function resetPassword(token: string, nuovaPassword: string): Promise<{ messaggio: string }> {
  let payload: { id: string; email: string; ruolo: Ruolo };
  try {
    payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; ruolo: Ruolo };
  } catch {
    throw new Error('Invalid or expired reset token');
  }

  const hashed = await bcrypt.hash(nuovaPassword, SALT_ROUNDS);

  if (payload.ruolo === 'STUDENTE') {
    await prisma.studente.update({ where: { matricola: payload.id }, data: { password: hashed } });
  } else if (payload.ruolo === 'DOCENTE') {
    await prisma.docente.update({ where: { id_docente: payload.id }, data: { password: hashed } });
  } else {
    await prisma.amministratore.update({ where: { id_admin: payload.id }, data: { password: hashed } });
  }

  return { messaggio: 'Password reimpostata con successo.' };
}
