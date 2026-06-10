import { prisma } from '../prisma/client';
import { formatTime } from '../utils/time';
async function notifica(destinatarioId: string, destinatarioRuolo: string, titolo: string, messaggio: string, tipo: string) {
  await prisma.notifica.create({
    data: { titolo, messaggio, tipo, destinatario_id: destinatarioId, destinatario_ruolo: destinatarioRuolo },
  });
}
function fmtLuogo(luogo: { nome_aula: string; edificio: string; piano: string } | null): string {
  if (!luogo) return '';
  return `${luogo.nome_aula}, ${luogo.edificio} (${luogo.piano})`;
}
function mapLuogoRicevimento(luogo: any) {
  if (!luogo) return undefined;
  return {
    id: luogo.id_luogo,
    aula: luogo.nome_aula,
    edificio: luogo.edificio,
    piano: luogo.piano,
    latitudine: luogo.latitudine,
    longitudine: luogo.longitudine,
  };
}
export async function createPrenotazione(
  data: {
    matricolaStudente: string;
    idSlot: string;
    argomento: string;
    descrizione?: string;
  },
  files?: Express.Multer.File[]
) {
  const matricola = data.matricolaStudente?.trim();
  const idSlot = data.idSlot?.trim();
  const studente = await prisma.studente.findUnique({
    where: { matricola: matricola },
  });
  if (!studente) {
    throw new Error('Studente non trovato');
  }
  const createData: Record<string, unknown> = {
    matricola_studente: matricola,
    id_slot: idSlot,
    argomento: data.argomento,
    descrizione: data.descrizione ?? '',
  };
  if (files && files.length > 0) {
    createData.documenti = {
      createMany: {
        data: files.map((f) => ({
          nome_file: f.originalname,
          tipo_file: f.mimetype,
          dimensione: f.size,
          percorso_file: f.filename,
        })),
      },
    };
  }
  try {
    const p = await prisma.$transaction(async (tx) => {
      const slot = await tx.slotRicevimento.findUnique({
        where: { id_slot: idSlot },
        include: { docente: true },
      });
      if (!slot) throw new Error('Slot not found');
      if (!slot.disponibilita) throw new Error('Slot non disponibile');
      const stessoGiorno = await tx.prenotazione.findFirst({
        where: {
          matricola_studente: matricola,
          slot: {
            id_docente: slot.id_docente,
            data: slot.data,
          },
        },
      });
      if (stessoGiorno) throw new Error('Hai già una prenotazione con questo docente nella stessa data');
      const prenotazione = await tx.prenotazione.create({
        data: createData as any,
        include: {
          studente: { select: { matricola: true, nome: true, cognome: true } },
          slot: {
            include: {
              docente: { select: { id_docente: true, nome: true, cognome: true, corsi: { select: { nome_corso: true } } } },
              luogo: true,
            },
          },
          documenti: true,
        },
      }) as any;
      await tx.slotRicevimento.update({
        where: { id_slot: idSlot },
        data: { disponibilita: false }
      });
      return prenotazione;
    });
    const docenteId = p.slot.docente.id_docente;
    const docenteNome = `${p.slot.docente.nome} ${p.slot.docente.cognome}`;
    const dataSlot = p.slot.data.toISOString().split('T')[0];
    await notifica(
      docenteId, 'DOCENTE',
      'Nuova prenotazione',
      `Lo studente ${p.studente.nome} ${p.studente.cognome} ha prenotato un ricevimento il ${dataSlot} alle ${formatTime(p.slot.ora_inizio)}. Argomento: ${p.argomento}`,
      'nuova_prenotazione'
    );
    return {
      id: p.id_prenotazione,
      studenteId: p.matricola_studente,
      slotId: p.id_slot,
      docente: `${p.slot.docente.nome} ${p.slot.docente.cognome}`,
      materia: p.slot.docente.corsi?.[0]?.nome_corso ?? '',
      data: p.slot.data.toISOString().split('T')[0],
      ora: formatTime(p.slot.ora_inizio),
      luogoRicevimento: mapLuogoRicevimento(p.slot.luogo),
      argomento: p.argomento,
      descrizione: p.descrizione,
      stato: p.stato_prenotazione.toLowerCase(),
      documenti: p.documenti?.map((d: any) => ({
        id: d.id_documento,
        nomeFile: d.nome_file,
        tipo: d.tipo_file,
        dimensione: d.dimensione,
        dataCaricamento: d.data_caricamento.toISOString(),
        percorso: d.percorso_file ? `/uploads/${d.percorso_file.split(/[\\/]/).pop()}` : '',
      })) ?? [],
    };
  } catch (error) {
    throw error;
  }
}
export async function annullaPrenotazione(id: string) {
  const prenotazione = await prisma.prenotazione.findUnique({
    where: { id_prenotazione: id },
    include: {
      slot: {
        include: {
          docente: { select: { id_docente: true, nome: true, cognome: true } },
        },
      },
      studente: { select: { nome: true, cognome: true } },
    },
  });
  if (!prenotazione) throw new Error('Prenotazione not found');
  const now = new Date();
  const dataStr = prenotazione.slot.data.toISOString().split('T')[0];
  const oraStr = formatTime(prenotazione.slot.ora_inizio);
  const slotDateTime = new Date(`${dataStr}T${oraStr}:00.000Z`);
  const diffMs = slotDateTime.getTime() - now.getTime();
  const diffOre = diffMs / (1000 * 60 * 60);
  if (diffOre < 3) throw new Error('Impossibile annullare: mancano meno di 3 ore all\'inizio del ricevimento');
  if (prenotazione.stato_prenotazione === 'ANNULLATA') return;
  await prisma.$transaction(async (tx) => {
    await tx.prenotazione.update({
      where: { id_prenotazione: id },
      data: { stato_prenotazione: 'ANNULLATA' },
    });
    await tx.slotRicevimento.update({
      where: { id_slot: prenotazione.id_slot },
      data: { disponibilita: true }
    });
  });
  const dataSlot = prenotazione.slot.data.toISOString().split('T')[0];
  await notifica(
    prenotazione.slot.docente.id_docente, 'DOCENTE',
    'Prenotazione annullata',
    `Lo studente ${prenotazione.studente.nome} ${prenotazione.studente.cognome} ha annullato la prenotazione del ${dataSlot} alle ${formatTime(prenotazione.slot.ora_inizio)}.`,
    'prenotazione_annullata'
  );
}

export async function getPrenotazioneDocenteId(id: string): Promise<string> {
  const prenotazione = await prisma.prenotazione.findUnique({
    where: { id_prenotazione: id },
    include: { slot: { select: { id_docente: true } } },
  });
  if (!prenotazione) throw new Error('Prenotazione not found');
  return prenotazione.slot.id_docente;
}

export async function eliminaPrenotazione(id: string) {
  const prenotazione = await prisma.prenotazione.findUnique({ where: { id_prenotazione: id } });
  if (!prenotazione) throw new Error('Prenotazione not found');
  await prisma.$transaction(async (tx) => {
    await tx.documento.deleteMany({ where: { id_prenotazione: id } });
    await tx.slotRicevimento.update({
      where: { id_slot: prenotazione.id_slot },
      data: { disponibilita: true },
    });
    await tx.prenotazione.delete({ where: { id_prenotazione: id } });
  });
}

export async function getPrenotazioniStudente(matricolaStudente: string) {
  const prenotazioni = await prisma.prenotazione.findMany({
    where: { matricola_studente: matricolaStudente },
    include: {
      slot: {
        include: {
          docente: { select: { id_docente: true, nome: true, cognome: true, corsi: { select: { nome_corso: true } } } },
          luogo: true,
        },
      },
    },
    orderBy: { slot: { data: 'desc' } },
  });
  return prenotazioni.map((p) => ({
    id: p.id_prenotazione,
    studenteId: p.matricola_studente,
    slotId: p.id_slot,
    docente: `${p.slot.docente.nome} ${p.slot.docente.cognome}`,
    materia: p.slot.docente.corsi?.[0]?.nome_corso ?? '',
    data: p.slot.data.toISOString().split('T')[0],
    ora: formatTime(p.slot.ora_inizio),
    luogo: fmtLuogo(p.slot.luogo),
    luogoRicevimento: mapLuogoRicevimento(p.slot.luogo),
    argomento: p.argomento,
    stato: p.stato_prenotazione.toLowerCase(),
  }));
}

export async function getPrenotazioniDocente(idDocente: string) {
  const prenotazioni = await prisma.prenotazione.findMany({
    where: { slot: { id_docente: idDocente } },
    include: {
      studente: { select: { matricola: true, nome: true, cognome: true } },
      slot: {
        include: { luogo: true },
      },
    },
    orderBy: { slot: { data: 'desc' } },
  });
  return prenotazioni.map((p) => ({
    id: p.id_prenotazione,
    studenteId: p.matricola_studente,
    slotId: p.id_slot,
    studente: `${p.studente.nome} ${p.studente.cognome}`,
    data: p.slot.data.toISOString().split('T')[0],
    oraInizio: formatTime(p.slot.ora_inizio),
    oraFine: formatTime(p.slot.ora_fine),
    luogo: fmtLuogo(p.slot.luogo),
    luogoRicevimento: mapLuogoRicevimento(p.slot.luogo),
    argomento: p.argomento,
    stato: p.stato_prenotazione.toLowerCase(),
  }));
}

export async function aggiornaStatoPrenotazione(id: string, stato: string) {
  const prenotazione = await prisma.prenotazione.findUnique({
    where: { id_prenotazione: id },
    include: {
      slot: {
        include: {
          docente: { select: { id_docente: true, nome: true, cognome: true } },
        },
      },
    },
  });
  if (!prenotazione) throw new Error('Prenotazione not found');
  const statoSup = stato.toUpperCase();
  const updated = await prisma.prenotazione.update({
    where: { id_prenotazione: id },
    data: { stato_prenotazione: statoSup },
    include: {
      slot: {
        include: {
          docente: { select: { id_docente: true, nome: true, cognome: true } },
          luogo: true,
        },
      },
    },
  });
  await prisma.$transaction(async (tx) => {
    if (statoSup === 'RIFIUTATA' || statoSup === 'ANNULLATA') {
      await tx.slotRicevimento.update({
        where: { id_slot: prenotazione.id_slot },
        data: { disponibilita: true },
      });
    }
    if (statoSup === 'CONFERMATA') {
      await tx.slotRicevimento.update({
        where: { id_slot: prenotazione.id_slot },
        data: { disponibilita: false },
      });
    }
    if (statoSup === 'CONFERMATA' || statoSup === 'RIFIUTATA' || statoSup === 'ANNULLATA') {
      const dataSlot = updated.slot.data.toISOString().split('T')[0];
      const label = statoSup === 'CONFERMATA' ? 'confermata' : statoSup === 'RIFIUTATA' ? 'rifiutata' : 'annullata';
      await tx.notifica.create({
        data: {
          titolo: `Prenotazione ${label}`,
          messaggio: `La tua prenotazione del ${dataSlot} alle ${formatTime(updated.slot.ora_inizio)} con il Prof. ${updated.slot.docente.nome} ${updated.slot.docente.cognome} è stata ${label.toUpperCase()}.`,
          tipo: 'stato_prenotazione',
          destinatario_id: updated.matricola_studente,
          destinatario_ruolo: 'STUDENTE',
        },
      });
    }
  });
  return {
    id: updated.id_prenotazione,
    studenteId: updated.matricola_studente,
    slotId: updated.id_slot,
    docente: `${updated.slot.docente.nome} ${updated.slot.docente.cognome}`,
    data: updated.slot.data.toISOString().split('T')[0],
    ora: formatTime(updated.slot.ora_inizio),
    luogo: fmtLuogo(updated.slot.luogo),
    argomento: updated.argomento,
    stato: updated.stato_prenotazione.toLowerCase(),
  };
}

export async function aggiungiDocumenti(idPrenotazione: string, files: Express.Multer.File[]) {
  const prenotazione = await prisma.prenotazione.findUnique({
    where: { id_prenotazione: idPrenotazione },
  });
  if (!prenotazione) throw new Error('Prenotazione not found');
  await prisma.documento.createMany({
    data: files.map((f) => ({
      id_prenotazione: idPrenotazione,
      nome_file: f.originalname,
      tipo_file: f.mimetype,
      dimensione: f.size,
      percorso_file: f.filename,
    })),
  });
  return await getPrenotazioneById(idPrenotazione);
}

export async function getPrenotazioneById(id: string) {
  const prenotazione = await prisma.prenotazione.findUnique({
    where: { id_prenotazione: id },
    include: {
      studente: { select: { matricola: true, nome: true, cognome: true, email: true } },
      slot: {
        include: { docente: { include: { corsi: { select: { nome_corso: true } } } }, luogo: true },
      },
      documenti: true,
    },
  });
  if (!prenotazione) throw new Error('Prenotazione not found');
  const materia = prenotazione.slot.docente.corsi?.[0]?.nome_corso ?? '';
  return {
    id: prenotazione.id_prenotazione,
    studenteId: prenotazione.matricola_studente,
    studente: `${prenotazione.studente.nome} ${prenotazione.studente.cognome}`,
    studenteEmail: prenotazione.studente.email,
    slotId: prenotazione.id_slot,
    docente: `${prenotazione.slot.docente.nome} ${prenotazione.slot.docente.cognome}`,
    materia,
    data: prenotazione.slot.data.toISOString().split('T')[0],
    ora: formatTime(prenotazione.slot.ora_inizio),
    luogo: fmtLuogo(prenotazione.slot.luogo),
    luogoRicevimento: mapLuogoRicevimento(prenotazione.slot.luogo),
    argomento: prenotazione.argomento,
    descrizione: prenotazione.descrizione,
    stato: prenotazione.stato_prenotazione.toLowerCase(),
    documenti: prenotazione.documenti.map((d) => ({
      id: d.id_documento,
      nomeFile: d.nome_file,
      tipo: d.tipo_file,
      dimensione: d.dimensione,
      dataCaricamento: d.data_caricamento.toISOString(),
      percorso: d.percorso_file ? `/uploads/${d.percorso_file.split(/[\\/]/).pop()}` : '',
    })),
  };
}
