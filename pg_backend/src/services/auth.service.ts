import { prisma } from '../prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendCodiceVerifica } from './email.service';
import { creaCodice, verificaCodice as verificaCodiceDb, consumaCodice } from './codice-verifica.service';

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

export interface Login2FARequiredResponse {
  requires2FA: true;
  email: string;
  nome: string;
  cognome: string;
  role: Ruolo;
  tempToken: string;
  codiceMostrato?: string;
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

  const cds = await prisma.corsoDiStudi.findUnique({ where: { nome: data.corsoDiStudi } });
  if (!cds) throw new Error('Corso di studi non trovato');
  const cdsId = cds.id_corso_di_studi;

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  await prisma.studente.create({
    data: {
      matricola: data.matricola,
      nome: data.nome,
      cognome: data.cognome,
      email: data.email,
      password: hashedPassword,
      id_corso_di_studi: cdsId,
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

export async function login(email: string, password: string): Promise<LoginResponse | Login2FARequiredResponse> {
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

  if (user.two_factor_abilitato) {
    const codice = await creaCodice(user.email, '2fa');
    await sendCodiceVerifica(user.email, codice, '2fa');

    const tempToken = jwt.sign(
      { id, email: user.email, ruolo, step: '2fa' },
      JWT_SECRET,
      { expiresIn: '5m' },
    );

    const response: Login2FARequiredResponse = {
      requires2FA: true,
      email: user.email,
      nome: user.nome,
      cognome,
      role: ruolo,
      tempToken,
    };

    if (process.env.NODE_ENV !== 'production') {
      response.codiceMostrato = codice;
    }

    return response;
  }

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
    const user = await prisma.studente.findUnique({
      where: { matricola: userId },
      include: { corso_di_studi: { select: { nome: true } } },
    });
    if (!user) throw new Error('User not found');
    return {
      id: user.matricola,
      nome: user.nome,
      cognome: user.cognome,
      email: user.email,
      role: 'STUDENTE',
      matricola: user.matricola,
      corsoDiStudi: user.corso_di_studi.nome,
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

  const codice = await creaCodice(email, 'reset_password');
  await sendCodiceVerifica(email, codice, 'reset_password');

  return { messaggio: "Se l'email esiste, riceverai un codice di verifica per il reset della password." };
}

export async function verificaCodice(email: string, codice: string): Promise<{ valido: boolean }> {
  const valido = await verificaCodiceDb(email, codice, 'reset_password');
  if (!valido) throw new Error('Codice non valido o scaduto');
  return { valido: true };
}

export async function resetPassword(email: string, codice: string, nuovaPassword: string): Promise<{ messaggio: string }> {
  const valido = await consumaCodice(email, codice, 'reset_password');
  if (!valido) throw new Error('Codice non valido o scaduto');

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

  const hashed = await bcrypt.hash(nuovaPassword, SALT_ROUNDS);
  const id = ruolo === 'STUDENTE' ? user.matricola : ruolo === 'DOCENTE' ? user.id_docente : user.id_admin;

  if (ruolo === 'STUDENTE') {
    await prisma.studente.update({ where: { matricola: id }, data: { password: hashed } });
  } else if (ruolo === 'DOCENTE') {
    await prisma.docente.update({ where: { id_docente: id }, data: { password: hashed } });
  } else {
    await prisma.amministratore.update({ where: { id_admin: id }, data: { password: hashed } });
  }

  return { messaggio: 'Password reimpostata con successo.' };
}

export async function verifica2FA(
  tempToken: string,
  codice: string,
): Promise<LoginResponse> {
  let payload: { id: string; email: string; ruolo: Ruolo; step: string };
  try {
    payload = jwt.verify(tempToken, JWT_SECRET) as typeof payload;
  } catch {
    throw new Error('Token non valido');
  }

  if (payload.step !== '2fa') throw new Error('Token non valido');

  const valido = await consumaCodice(payload.email, codice, '2fa');
  if (!valido) throw new Error('Codice non valido o scaduto');

  const { accessToken } = generateTokens({
    id: payload.id,
    email: payload.email,
    ruolo: payload.ruolo,
  });

  let user: any;
  let cognome: string;
  const { id, email, ruolo } = payload;

  if (ruolo === 'STUDENTE') {
    user = await prisma.studente.findUnique({ where: { matricola: id } });
    cognome = user?.cognome ?? '';
  } else if (ruolo === 'DOCENTE') {
    user = await prisma.docente.findUnique({ where: { id_docente: id } });
    cognome = user?.cognome ?? '';
  } else {
    user = await prisma.amministratore.findUnique({ where: { id_admin: id } });
    cognome = '';
  }

  return {
    id,
    nome: user?.nome ?? '',
    cognome,
    email,
    role: ruolo,
    token: accessToken,
  };
}

async function trovaUtentePerId(id: string, ruolo: Ruolo): Promise<{ email: string; password: string; two_factor_abilitato: boolean } | null> {
  if (ruolo === 'STUDENTE') {
    return prisma.studente.findUnique({ where: { matricola: id }, select: { email: true, password: true, two_factor_abilitato: true } });
  }
  if (ruolo === 'DOCENTE') {
    return prisma.docente.findUnique({ where: { id_docente: id }, select: { email: true, password: true, two_factor_abilitato: true } });
  }
  return prisma.amministratore.findUnique({ where: { id_admin: id }, select: { email: true, password: true, two_factor_abilitato: true } });
}

async function aggiorna2FA(id: string, ruolo: Ruolo, abilitato: boolean): Promise<void> {
  if (ruolo === 'STUDENTE') {
    await prisma.studente.update({ where: { matricola: id }, data: { two_factor_abilitato: abilitato } });
  } else if (ruolo === 'DOCENTE') {
    await prisma.docente.update({ where: { id_docente: id }, data: { two_factor_abilitato: abilitato } });
  } else {
    await prisma.amministratore.update({ where: { id_admin: id }, data: { two_factor_abilitato: abilitato } });
  }
}

export async function abilita2FA(userId: string, ruolo: Ruolo): Promise<{ messaggio: string; codiceMostrato?: string }> {
  const user = await trovaUtentePerId(userId, ruolo);
  if (!user) throw new Error('Utente non trovato');
  if (user.two_factor_abilitato) throw new Error('2FA già abilitata');

  const codice = await creaCodice(user.email, '2fa');
  await sendCodiceVerifica(user.email, codice, '2fa');

  const result: { messaggio: string; codiceMostrato?: string } = {
    messaggio: 'Codice di verifica inviato alla tua email.',
  };

  if (process.env.NODE_ENV !== 'production') {
    result.codiceMostrato = codice;
  }

  return result;
}

export async function confermaAbilita2FA(userId: string, ruolo: Ruolo, codice: string): Promise<{ messaggio: string }> {
  const user = await trovaUtentePerId(userId, ruolo);
  if (!user) throw new Error('Utente non trovato');
  if (user.two_factor_abilitato) throw new Error('2FA già abilitata');

  const valido = await consumaCodice(user.email, codice, '2fa');
  if (!valido) throw new Error('Codice non valido o scaduto');

  await aggiorna2FA(userId, ruolo, true);

  return { messaggio: 'Autenticazione a due fattori abilitata con successo.' };
}

export async function disabilita2FA(userId: string, ruolo: Ruolo, password: string): Promise<{ messaggio: string }> {
  if (ruolo === 'AMMINISTRATORE') throw new Error('La 2FA è obbligatoria per gli amministratori');

  const user = await trovaUtentePerId(userId, ruolo);
  if (!user) throw new Error('Utente non trovato');
  if (!user.two_factor_abilitato) throw new Error('2FA già disabilitata');

  const valid = await bcrypt.compare(password, (user as any).password);
  if (!valid) throw new Error('Password errata');

  await aggiorna2FA(userId, ruolo, false);

  return { messaggio: 'Autenticazione a due fattori disabilitata con successo.' };
}

export async function getStato2FA(userId: string, ruolo: Ruolo): Promise<{ abilitato: boolean }> {
  const user = await trovaUtentePerId(userId, ruolo);
  if (!user) throw new Error('Utente non trovato');

  return { abilitato: user.two_factor_abilitato };
}
