import { prisma } from '../prisma/client';

export interface NotificaResponse {
  id: string;
  titolo: string;
  messaggio: string;
  dataInvio: string;
  tipo: string;
  letta: boolean;
  destinatarioId: string;
  destinatarioRuolo: string;
}

function mapNotifica(n: any): NotificaResponse {
  return {
    id: n.id_notifica,
    titolo: n.titolo,
    messaggio: n.messaggio,
    dataInvio: n.data_invio.toISOString(),
    tipo: n.tipo,
    letta: n.letta,
    destinatarioId: n.destinatario_id,
    destinatarioRuolo: n.destinatario_ruolo,
  };
}

export async function getNotifiche(destinatarioId: string, ruolo?: string): Promise<NotificaResponse[]> {
  const where: any = { destinatario_id: destinatarioId };
  if (ruolo) where.destinatario_ruolo = ruolo;

  const notifiche = await prisma.notifica.findMany({
    where,
    orderBy: { data_invio: 'desc' },
  });

  return notifiche.map(mapNotifica);
}

export async function createNotifica(data: {
  titolo: string;
  messaggio: string;
  tipo: string;
  destinatarioId: string;
  destinatarioRuolo: string;
}): Promise<NotificaResponse> {
  const notifica = await prisma.notifica.create({
    data: {
      titolo: data.titolo,
      messaggio: data.messaggio,
      tipo: data.tipo,
      destinatario_id: data.destinatarioId,
      destinatario_ruolo: data.destinatarioRuolo,
    },
  });

  return mapNotifica(notifica);
}

export async function segnaComeLetta(id: string): Promise<void> {
  const notifica = await prisma.notifica.findUnique({ where: { id_notifica: id } });
  if (!notifica) throw new Error('Notifica not found');

  await prisma.notifica.update({
    where: { id_notifica: id },
    data: { letta: true },
  });
}

export async function segnaTutteComeLette(destinatarioId: string): Promise<void> {
  await prisma.notifica.updateMany({
    where: { destinatario_id: destinatarioId, letta: false },
    data: { letta: true },
  });
}

export async function cancellaNotificheLette(destinatarioId: string): Promise<void> {
  await prisma.notifica.deleteMany({
    where: { destinatario_id: destinatarioId, letta: true },
  });
}
