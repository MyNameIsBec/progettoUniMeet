import { prisma } from '../prisma/client';

export interface BachecaResponse {
  id: string;
  titolo: string;
  descrizione: string;
  idCorsoDiStudi: string;
  dataUltimoAggiornamento: string;
  faqs: FAQResponse[];
}

export interface FAQResponse {
  id: string;
  domanda: string;
  risposta: string;
  dataPubblicazione: string;
  ultimaModifica: string;
}

function mapBacheca(bacheca: any): BachecaResponse {
  return {
    id: bacheca.id_bacheca,
    titolo: bacheca.titolo,
    descrizione: bacheca.descrizione,
    idCorsoDiStudi: bacheca.id_corso_di_studi,
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
  };
}

export async function getBachecaByCorsoDiStudi(idCorsoDiStudi: string): Promise<BachecaResponse> {
  let bacheca = await prisma.bacheca.findUnique({
    where: { id_corso_di_studi: idCorsoDiStudi },
    include: {
      faqs: { orderBy: { data_pubblicazione: 'desc' } },
    },
  });

  if (!bacheca) {
    const cds = await prisma.corsoDiStudi.findUnique({ where: { id_corso_di_studi: idCorsoDiStudi } });
    if (!cds) throw new Error('CorsoDiStudi not found');

    bacheca = await prisma.bacheca.create({
      data: {
        titolo: `Bacheca - ${cds.nome}`,
        descrizione: '',
        id_corso_di_studi: idCorsoDiStudi,
      },
      include: {
        faqs: { orderBy: { data_pubblicazione: 'desc' } },
      },
    });
  }

  return mapBacheca(bacheca);
}

export async function updateBacheca(idCorsoDiStudi: string, data: {
  titolo?: string;
  descrizione?: string;
}): Promise<BachecaResponse> {
  const bacheca = await prisma.bacheca.findUnique({ where: { id_corso_di_studi: idCorsoDiStudi } });
  if (!bacheca) throw new Error('Bacheca not found');

  const updateData: any = {};
  if (data.titolo !== undefined) updateData.titolo = data.titolo;
  if (data.descrizione !== undefined) updateData.descrizione = data.descrizione;

  const updated = await prisma.bacheca.update({
    where: { id_corso_di_studi: idCorsoDiStudi },
    data: updateData,
    include: {
      faqs: { orderBy: { data_pubblicazione: 'desc' } },
    },
  });

  return mapBacheca(updated);
}

export async function getFaqByBacheca(idCorsoDiStudi: string): Promise<FAQResponse[]> {
  const bacheca = await prisma.bacheca.findUnique({ where: { id_corso_di_studi: idCorsoDiStudi } });
  if (!bacheca) throw new Error('Bacheca not found');

  const faqs = await prisma.fAQ.findMany({
    where: { id_bacheca: bacheca.id_bacheca },
    orderBy: { data_pubblicazione: 'desc' },
  });

  return faqs.map(mapFaq);
}

export async function createFaq(idCorsoDiStudi: string, data: {
  domanda: string;
  risposta: string;
}): Promise<FAQResponse> {
  const bacheca = await prisma.bacheca.findUnique({ where: { id_corso_di_studi: idCorsoDiStudi } });
  if (!bacheca) throw new Error('Bacheca not found');

  const faq = await prisma.fAQ.create({
    data: {
      domanda: data.domanda,
      risposta: data.risposta,
      id_bacheca: bacheca.id_bacheca,
    },
  });

  return mapFaq(faq);
}

export async function updateFaq(id: string, data: {
  domanda?: string;
  risposta?: string;
}): Promise<FAQResponse> {
  const faq = await prisma.fAQ.findUnique({ where: { id_faq: id } });
  if (!faq) throw new Error('FAQ not found');

  const updateData: any = {};
  if (data.domanda !== undefined) updateData.domanda = data.domanda;
  if (data.risposta !== undefined) updateData.risposta = data.risposta;

  const updated = await prisma.fAQ.update({
    where: { id_faq: id },
    data: updateData,
  });

  return mapFaq(updated);
}

export async function deleteFaq(id: string): Promise<void> {
  const faq = await prisma.fAQ.findUnique({ where: { id_faq: id } });
  if (!faq) throw new Error('FAQ not found');

  await prisma.fAQ.delete({ where: { id_faq: id } });
}
