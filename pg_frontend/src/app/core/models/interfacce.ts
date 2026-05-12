// NAVIGAZIONE
export interface VoceMenuNavigazione {
  etichetta: string;
  percorso: string;
  icona: string;
  esatto?: boolean;
}

// UTENTI
export interface Utente {
  id: string | number;
  nome: string;
  cognome?: string;
  email: string;
  ruolo?: 'studente' | 'docente' | 'admin';
  avatar?: string;
}

export interface Studente extends Utente {
  matricola?: string;
  corsoDiStudi?: string;
}

export interface Docente extends Utente {
  ufficio: string;
  bio?: string;
  iniziali?: string;
  coloreAvatar?: string;
  materia?: string;
  prossimoSlot?: string;
  disponibile?: boolean;
  descrizione?: string;
}

export interface Amministratore extends Utente {
  dipartimento?: string;
}

export interface Corso {
  id: string | number;
  nome: string;
  cfu: number;
  anno: number;
  docenteId: string | number;
}

// PRENOTAZIONI
export interface LuogoRicevimento {
  id: string | number;
  aula: string;
  edificio: string;
  piano: number;
  latitudine?: number;
  longitudine?: number;
}

export interface SlotRicevimento {
  id: string | number;
  docenteId: string | number;
  materia: string;
  data: Date;
  oraInizio: string;
  oraFine: string;
  stato: 'disponibile' | 'occupato' | 'non_prenotabile';
  luogo: LuogoRicevimento;
}

export interface Documento {
  id: string | number;
  nomeFile: string;
  tipo: string;
  dimensione: number;
  dataCaricamento: string;
  percorso: string;
}

export interface Prenotazione {
  id?: string | number;
  studenteId?: string | number;
  slotId?: string | number;
  docente: string;
  materia: string;
  data: string;
  ora: string;
  luogo: string;
  argomento?: string;
  descrizione?: string;
  stato: 'in_attesa' | 'confermata' | 'completata' | 'annullata';
  documenti?: Documento[];
}

// BACHECA E NOTIFICHE
export interface FAQ {
  id: number;
  domanda: string;
  risposta: string;
  aperta: boolean;
  dataPubblicazione?: string;
}

export interface LinkUtile {
  id: number;
  titolo: string;
  descrizione: string;
  icona: string;
  colore: string;
  url: string;
}

export interface Notifica {
  id: string;
  tipo: 'reminder' | 'sistema' | 'annullamento';
  dataInvio: string;
  messaggio: string;
  letta: boolean;
}
