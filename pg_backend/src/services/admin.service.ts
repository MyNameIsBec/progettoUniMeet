import { prisma } from '../prisma/client';

export interface AdminStats {
  totaleStudenti: number;
  totaleDocenti: number;
  totalePrenotazioni: number;
  slotAttivi: number;
  prenotazioniOggi: number;
}

export async function getStats(): Promise<AdminStats> {
  const [totaleStudenti, totaleDocenti, totalePrenotazioni, slotAttivi, prenotazioniOggi] =
    await Promise.all([
      prisma.studente.count(),
      prisma.docente.count(),
      prisma.prenotazione.count(),
      prisma.slotRicevimento.count({ where: { disponibilita: true } }),
      prisma.prenotazione.count({
        where: {
          data_prenotazione: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

  return { totaleStudenti, totaleDocenti, totalePrenotazioni, slotAttivi, prenotazioniOggi };
}
