export interface SlotRicevimento {
  id: string;
  docenteId: string;
  data: string;         
  oraInizio: string;
  oraFine: string;
  stato: 'disponibile' | 'occupato' | 'non_prenotabile';
  luogo: LuogoRicevimento;
}

export interface Prenotazione {
  id: string;
  studenteId: string;
  slotId: string;
  dataPrenotazione: string;
  argomento: string;
  descrizione: string;
  stato: 'in_attesa' | 'confermata' | 'completata' | 'annullata';
  documenti?: Documento[];
}

export interface Documento {
  id: string;
  nomeFile: string;
  tipo: string;
  dimensione: number;
  dataCaricamento: string;
  percorso: string;
}

export interface LuogoRicevimento {
  id: string;
  aula: string;
  edificio: string;
  piano: number;
  latitudine: number;
  longitudine: number;
}

export interface Notifica {
  id: string;
  tipo: 'reminder' | 'sistema' | 'annullamento';
  dataInvio: string;
  messaggio: string;
  letta: boolean;
}

export interface Bacheca{
    id: string;
    titolo: string;
    descrizione: string;
    ultimaModifica: string;
    faq: FAQ[];
}

export interface FAQ {
  id: string;
  domanda: string;
  risposta: string;
  dataPubblicazione: string;
  ultimaModifica: string;
}