export interface VoceMenuNavigazione {
  etichetta: string;
  percorso: string;
  icona: string;
  esatto?: boolean;
}

export interface Utente {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: 'studente' | 'docente' | 'admin';
}

export interface Studente extends Utente {
  matricola: string;
  corsoDiStudi: string;
  corsoDiStudiId?: string;
}

export interface Docente extends Utente {
  ufficio: string;
  materia: string;
  coloreAvatar?: string;
  iniziali?: string;
  descrizione?: string;
  prossimoSlot?: string;
  corsoDiStudi: string[];
  corsi?: { id: string; nome: string }[];
  corsiDiStudi?: { id: string; nome: string }[];
}

export interface Amministratore extends Utente {
  dipartimento?: string;
}

export interface CorsoDiStudi {
  id: string;
  nome: string;
}

export interface Corso {
  id: string;
  nome: string;
  cfu: number;
  anno: number;
  docenteId: string;
}

export interface LuogoRicevimento {
  id: string;
  aula: string;
  edificio: string;
  piano: string;
  latitudine: number;
  longitudine: number;
}

export interface SlotRicevimento {
  id: string;
  docenteId: string;
  data: Date;
  oraInizio: string;
  oraFine: string;
  disponibilita: boolean;
  stato?: 'disponibile' | 'occupato' | 'non_prenotabile';
  luogo?: LuogoRicevimento;
}

export interface Documento {
  id: string;
  nomeFile: string;
  tipo: 'pdf' | 'doc' | 'altro';
  studente: string;
  prenotazioneId: string;
  data: string;
  percorso: string;
  dimensione?: number;
}

export interface Prenotazione {
  id: string;
  studenteId: string;
  slotId?: string;
  docente: string;
  materia: string;
  data: string;
  ora: string;
  argomento?: string;
  descrizione?: string;
  stato: 'in_attesa' | 'confermata' | 'completata' | 'annullata';
  documenti?: Documento[];
  luogo: string;
  luogoRicevimento?: LuogoRicevimento;
  studente?: string;
}

export interface Bacheca {
  id: string;
  titolo: string;
  descrizione: string;
  idCorsoDiStudi?: string;
  nomeCorsoDiStudi?: string;
  faqs?: FAQ[];
  dataUltimoAggiornamento?: string;
}

export interface FAQ {
  id: string;
  domanda: string;
  risposta: string;
  aperta: boolean;
  dataPubblicazione?: string;
}
