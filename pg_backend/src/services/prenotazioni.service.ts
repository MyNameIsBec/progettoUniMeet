import { prisma } from '../prisma/client';

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

  const slot = await prisma.slotRicevimento.findUnique({
    where: { id_slot: idSlot },
    include: { docente: true },
  });
  if (!slot) throw new Error('Slot not found');
  if (!slot.disponibilita) throw new Error('Slot non disponibile');

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
    const p = await prisma.prenotazione.create({
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

    // Aggiorniamo la disponibilità dello slot a false dopo la prenotazione
    await prisma.slotRicevimento.update({
      where: { id_slot: idSlot },
      data: { disponibilita: false }
    });
    
    return {
      id: p.id_prenotazione,
      studenteId: p.matricola_studente,
      slotId: p.id_slot,
      docente: `${p.slot.docente.nome} ${p.slot.docente.cognome}`,
      materia: p.slot.docente.corsi?.[0]?.nome_corso ?? '',
      data: p.slot.data.toISOString().split('T')[0],
      ora: `${p.slot.ora_inizio.toISOString().split('T')[1]?.substring(0, 5)}`,
      luogo: fmtLuogo(p.slot.luogo),
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
  const prenotazione = await prisma.prenotazione.findUnique({ where: { id_prenotazione: id } });
  if (!prenotazione) throw new Error('Prenotazione not found');

  await prisma.prenotazione.update({
    where: { id_prenotazione: id },
    data: { stato_prenotazione: 'ANNULLATA' },
  });

  // Ripristiniamo la disponibilità dello slot
  await prisma.slotRicevimento.update({
    where: { id_slot: prenotazione.id_slot },
    data: { disponibilita: true }
  });
}

export async function eliminaPrenotazione(id: string) {
  const prenotazione = await prisma.prenotazione.findUnique({ where: { id_prenotazione: id } });
  if (!prenotazione) throw new Error('Prenotazione not found');

  // Cancelliamo prima i documenti associati per evitare errori di vincolo (se non in cascade)
  await prisma.documento.deleteMany({
    where: { id_prenotazione: id }
  });

  await prisma.prenotazione.delete({
    where: { id_prenotazione: id }
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
    ora: `${p.slot.ora_inizio.toISOString().split('T')[1]?.substring(0, 5)}`,
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
    oraInizio: p.slot.ora_inizio.toISOString().split('T')[1]?.substring(0, 5),
    oraFine: p.slot.ora_fine.toISOString().split('T')[1]?.substring(0, 5),
    luogo: fmtLuogo(p.slot.luogo),
    luogoRicevimento: mapLuogoRicevimento(p.slot.luogo),
    argomento: p.argomento,
    stato: p.stato_prenotazione.toLowerCase(),
  }));
}

export async function aggiornaStatoPrenotazione(id: string, stato: string) {
  const prenotazione = await prisma.prenotazione.findUnique({ where: { id_prenotazione: id } });
  if (!prenotazione) throw new Error('Prenotazione not found');

  const updated = await prisma.prenotazione.update({
    where: { id_prenotazione: id },
    data: { stato_prenotazione: stato },
    include: {
      slot: {
        include: {
          docente: { select: { id_docente: true, nome: true, cognome: true } },
          luogo: true,
        },
      },
    },
  });

  return {
    id: updated.id_prenotazione,
    studenteId: updated.matricola_studente,
    slotId: updated.id_slot,
    docente: `${updated.slot.docente.nome} ${updated.slot.docente.cognome}`,
    data: updated.slot.data.toISOString().split('T')[0],
    ora: `${updated.slot.ora_inizio.toISOString().split('T')[1]?.substring(0, 5)}`,
    luogo: fmtLuogo(updated.slot.luogo),
    argomento: updated.argomento,
    stato: updated.stato_prenotazione.toLowerCase(),
  };
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
    ora: `${prenotazione.slot.ora_inizio.toISOString().split('T')[1]?.substring(0, 5)}`,
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