import { prisma } from '../prisma/client';

export interface BachecaResponse {
  id: string;
  titolo: string;
  descrizione: string;
  idCorsoDiStudi: string;
  nomeCorsoDiStudi: string;
  idCorso: string;
  nomeCorso: string;
  dataUltimoAggiornamento: string;
  faqs: FAQResponse[];
}

export interface FAQResponse {
  id: string;
  domanda: string;
  risposta: string;
  dataPubblicazione: string;
  ultimaModifica: string;
  idDocente?: string;
  nomeDocente?: string;
}

function mapBacheca(bacheca: any): BachecaResponse {
  return {
    id: bacheca.id_bacheca,
    titolo: bacheca.titolo,
    descrizione: bacheca.descrizione,
    idCorsoDiStudi: bacheca.id_corso_di_studi,
    nomeCorsoDiStudi: bacheca.corso_di_studi?.nome ?? '',
    idCorso: bacheca.id_corso,
    nomeCorso: bacheca.corso?.nome_corso ?? '',
    dataUltimoAggiornamento: bacheca.data_ultimo_aggiornamento.toISOString(),
    faqs: (bacheca.faqs || []).map(mapFaq),
  };
}

function mapFaq(faq: any): FAQResponse {
  return {
    id: faq.id_faq,
    domanda: faq.domanda,
    risposta: faq.risposta,
    dataPubblicazione: faq.data_pubblicazione.toISOString(),
    ultimaModifica: faq.ultima_modifica.toISOString(),
    ...(faq.id_docente && { idDocente: faq.id_docente }),
    ...(faq.docente && { nomeDocente: `${faq.docente.nome} ${faq.docente.cognome}` }),
  };
}

const bachecaInclude = {
  corso_di_studi: true,
  corso: true,
  faqs: {
    orderBy: { data_pubblicazione: 'desc' as const },
    include: { docente: true },
  },
};

export async function getBachecaByCorso(idCorso: string): Promise<BachecaResponse> {
  const bacheca = await prisma.bacheca.findUnique({
    where: { id_corso: idCorso },
    include: bachecaInclude,
  });

  if (!bacheca) {
    const corso = await prisma.corso.findUnique({
      where: { id_corso: idCorso },
      include: { corso_di_studi: true },
    });
    if (!corso) throw new Error('Corso not found');

    if (!corso.id_corso_di_studi) throw new Error('Il corso non ha un corso di studi associato');

    const created = await prisma.bacheca.create({
      data: {
        titolo: `Bacheca - ${corso.nome_corso}`,
        descrizione: '',
        id_corso_di_studi: corso.id_corso_di_studi,
        id_corso: idCorso,
      },
      include: bachecaInclude,
    });

    return mapBacheca(created);
  }

  return mapBacheca(bacheca);
}

export async function getBachecheByCorsoDiStudi(idCorsoDiStudi: string): Promise<BachecaResponse[]> {
  const cds = await prisma.corsoDiStudi.findUnique({ where: { id_corso_di_studi: idCorsoDiStudi } });
  if (!cds) throw new Error('CorsoDiStudi not found');

  const corsi = await prisma.corso.findMany({
    where: { id_corso_di_studi: idCorsoDiStudi },
  });

  if (corsi.length === 0) return [];

  const bacheche = await Promise.all(
    corsi.map((corso) => getBachecaByCorso(corso.id_corso))
  );

  return bacheche;
}

export async function getBachecheByDocente(idDocente: string): Promise<BachecaResponse[]> {
  const corsi = await prisma.corso.findMany({
    where: { id_docente: idDocente },
  });

  if (corsi.length === 0) return [];

  const bacheche = await Promise.all(
    corsi.map((corso) => getBachecaByCorso(corso.id_corso))
  );

  return bacheche;
}

export async function verificaDocenteCorso(idDocente: string, idCorso: string): Promise<boolean> {
  const corso = await prisma.corso.findUnique({ where: { id_corso: idCorso } });
  if (!corso) return false;
  return corso.id_docente === idDocente;
}

export async function updateBacheca(idCorso: string, data: {
  titolo?: string;
  descrizione?: string;
}): Promise<BachecaResponse> {
  const bacheca = await prisma.bacheca.findUnique({ where: { id_corso: idCorso } });
  if (!bacheca) throw new Error('Bacheca not found');

  const updateData: any = {};
  if (data.titolo !== undefined) updateData.titolo = data.titolo;
  if (data.descrizione !== undefined) updateData.descrizione = data.descrizione;

  const updated = await prisma.bacheca.update({
    where: { id_corso: idCorso },
    data: updateData,
    include: bachecaInclude,
  });

  return mapBacheca(updated);
}

export async function getFaqByBacheca(idCorso: string): Promise<FAQResponse[]> {
  const bacheca = await prisma.bacheca.findUnique({ where: { id_corso: idCorso } });
  if (!bacheca) throw new Error('Bacheca not found');

  const faqs = await prisma.fAQ.findMany({
    where: { id_bacheca: bacheca.id_bacheca },
    orderBy: { data_pubblicazione: 'desc' },
    include: { docente: true },
  });

  return faqs.map(mapFaq);
}

export async function createFaq(idCorso: string, data: {
  domanda: string;
  risposta: string;
  idDocente?: string;
}): Promise<FAQResponse> {
  const bacheca = await prisma.bacheca.findUnique({ where: { id_corso: idCorso } });
  if (!bacheca) throw new Error('Bacheca not found');

  const faq = await prisma.fAQ.create({
    data: {
      domanda: data.domanda,
      risposta: data.risposta,
      id_bacheca: bacheca.id_bacheca,
      id_docente: data.idDocente ?? null,
    },
    include: { docente: true },
  });

  return mapFaq(faq);
}

export async function updateFaq(id: string, data: {
  domanda?: string;
  risposta?: string;
  idDocente?: string;
}): Promise<FAQResponse> {
  const faq = await prisma.fAQ.findUnique({ where: { id_faq: id } });
  if (!faq) throw new Error('FAQ not found');

  const updateData: any = {};
  if (data.domanda !== undefined) updateData.domanda = data.domanda;
  if (data.risposta !== undefined) updateData.risposta = data.risposta;
  if (data.idDocente !== undefined) updateData.id_docente = data.idDocente;

  const updated = await prisma.fAQ.update({
    where: { id_faq: id },
    data: updateData,
    include: { docente: true },
  });

  return mapFaq(updated);
}

export async function deleteFaq(id: string): Promise<void> {
  const faq = await prisma.fAQ.findUnique({ where: { id_faq: id } });
  if (!faq) throw new Error('FAQ not found');

  await prisma.fAQ.delete({ where: { id_faq: id } });
}

export async function getFaqById(id: string): Promise<{ idBacheca: string; idDocente?: string | null; idCorso: string }> {
  const faq = await prisma.fAQ.findUnique({
    where: { id_faq: id },
    select: {
      id_faq: true,
      bacheca: { select: { id_corso: true } },
      id_docente: true,
    },
  });
  if (!faq) throw new Error('FAQ not found');
  return { idBacheca: faq.bacheca.id_corso, idDocente: faq.id_docente, idCorso: faq.bacheca.id_corso };
}
