import { schedule } from 'node-cron';
import { prisma } from '../prisma/client';

async function notifica(destinatarioId: string, destinatarioRuolo: string, titolo: string, messaggio: string, tipo: string) {
  await prisma.notifica.create({
    data: { titolo, messaggio, tipo, destinatario_id: destinatarioId, destinatario_ruolo: destinatarioRuolo },
  });
}

async function reminderGiaInviato(destinatarioId: string, tipo: string): Promise<boolean> {
  const oggi = new Date();
  oggi.setUTCHours(0, 0, 0, 0);
  const existing = await prisma.notifica.findFirst({
    where: {
      destinatario_id: destinatarioId,
      tipo,
      data_invio: { gte: oggi },
    },
  });
  return existing !== null;
}

async function processaReminder() {
  const ora = new Date();

  const oggi = new Date(Date.UTC(ora.getUTCFullYear(), ora.getUTCMonth(), ora.getUTCDate()));
  const domani = new Date(oggi);
  domani.setUTCDate(domani.getUTCDate() + 1);

  const oraMs = ora.getUTCHours() * 3600000 + ora.getUTCMinutes() * 60000 + ora.getUTCSeconds() * 1000;
  const tra1oraMs = oraMs + 3600000;
  const tra1ora5minMs = oraMs + 3900000;

  const prenotazioniDomani = await prisma.prenotazione.findMany({
    where: {
      stato_prenotazione: 'CONFERMATA',
      slot: { data: domani },
    },
    include: {
      slot: {
        include: {
          docente: { select: { id_docente: true, nome: true, cognome: true, notifiche_app: true } },
        },
      },
      studente: { select: { matricola: true, nome: true, cognome: true, notifiche_app: true } },
    },
  });

  for (const p of prenotazioniDomani) {
    if (p.studente.notifiche_app) {
      if (!(await reminderGiaInviato(p.studente.matricola, 'reminder_24h'))) {
        await notifica(
          p.studente.matricola, 'STUDENTE',
          'Promemoria ricevimento',
          `Hai un ricevimento DOMANI con il Prof. ${p.slot.docente.nome} ${p.slot.docente.cognome} alle ${formatOra(p.slot.ora_inizio)}.`,
          'reminder_24h'
        );
      }
    }
    if (p.slot.docente.notifiche_app) {
      if (!(await reminderGiaInviato(p.slot.docente.id_docente, 'reminder_24h'))) {
        await notifica(
          p.slot.docente.id_docente, 'DOCENTE',
          'Promemoria ricevimento',
          `Hai un ricevimento DOMANI con lo studente ${p.studente.nome} ${p.studente.cognome} alle ${formatOra(p.slot.ora_inizio)}.`,
          'reminder_24h'
        );
      }
    }
  }

  const prenotazioniOggi = await prisma.prenotazione.findMany({
    where: {
      stato_prenotazione: 'CONFERMATA',
      slot: { data: oggi },
    },
    include: {
      slot: {
        include: {
          docente: { select: { id_docente: true, nome: true, cognome: true, notifiche_app: true } },
        },
      },
      studente: { select: { matricola: true, nome: true, cognome: true, notifiche_app: true } },
    },
  });

  for (const p of prenotazioniOggi) {
    const slotMs = p.slot.ora_inizio.getUTCHours() * 3600000 + p.slot.ora_inizio.getUTCMinutes() * 60000;
    if (slotMs >= tra1oraMs && slotMs <= tra1ora5minMs) {
      if (p.studente.notifiche_app) {
        if (!(await reminderGiaInviato(p.studente.matricola, 'reminder_1h'))) {
          await notifica(
            p.studente.matricola, 'STUDENTE',
            'Promemoria ricevimento',
            `Hai un ricevimento tra 1 ora con il Prof. ${p.slot.docente.nome} ${p.slot.docente.cognome} alle ${formatOra(p.slot.ora_inizio)}.`,
            'reminder_1h'
          );
        }
      }
      if (p.slot.docente.notifiche_app) {
        if (!(await reminderGiaInviato(p.slot.docente.id_docente, 'reminder_1h'))) {
          await notifica(
            p.slot.docente.id_docente, 'DOCENTE',
            'Promemoria ricevimento',
            `Hai un ricevimento tra 1 ora con lo studente ${p.studente.nome} ${p.studente.cognome} alle ${formatOra(p.slot.ora_inizio)}.`,
            'reminder_1h'
          );
        }
      }
    }
  }
}

function formatOra(d: Date): string {
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function avviaReminderJob() {
  schedule('* * * * *', () => {
    processaReminder().catch((err) => {
      console.error('Errore reminder job:', err);
    });
  });
  console.log('Reminder job avviato (ogni minuto)');
}
