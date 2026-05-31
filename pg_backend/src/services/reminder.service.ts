import cron from 'node-cron';
import { prisma } from '../prisma/client';

async function notifica(destinatarioId: string, destinatarioRuolo: string, titolo: string, messaggio: string, tipo: string) {
  await prisma.notifica.create({
    data: { titolo, messaggio, tipo, destinatario_id: destinatarioId, destinatario_ruolo: destinatarioRuolo },
  });
}

async function reminderGiaInviato(destinatarioId: string, tipo: string): Promise<boolean> {
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
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

  const oggi = new Date(ora.getFullYear(), ora.getMonth(), ora.getDate());
  const domani = new Date(oggi);
  domani.setDate(domani.getDate() + 1);

  const tra1ora = new Date(ora.getTime() + 60 * 60 * 1000);
  const tra1ora5min = new Date(ora.getTime() + 65 * 60 * 1000);

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
    const oraInizio = new Date(p.slot.ora_inizio);
    if (oraInizio >= tra1ora && oraInizio <= tra1ora5min) {
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
  return d.toTimeString().slice(0, 5);
}

export function avviaReminderJob() {
  cron.schedule('* * * * *', () => {
    processaReminder().catch((err) => {
      console.error('Errore reminder job:', err);
    });
  });
  console.log('Reminder job avviato (ogni minuto)');
}
