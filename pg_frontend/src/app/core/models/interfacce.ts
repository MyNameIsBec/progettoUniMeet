// NAVIGAZIONE
export interface VoceMenuNavigazione {
  etichetta: string;
  percorso: string;
  icona: string;
  esatto?: boolean;
}

// UTENTI
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
}

export interface Docente extends Utente {
  ufficio: string;
  materia: string;
  disponibile?: boolean;
  coloreAvatar?: string;
  iniziali?: string;
  descrizione?: string;
  prossimoSlot?: string;
}

export interface Amministratore extends Utente {
  dipartimento?: string;
}

export interface Corso {
  id: string ;
  nome: string;
  cfu: number;
  anno: number;
  docenteId: string;
}

// PRENOTAZIONI
export interface LuogoRicevimento {
  id: string ;
  aula: string;
  edificio: string;
  piano: number;
  latitudine: number;
  longitudine: number;
}

export interface SlotRicevimento {
  id: string ;
  docenteId: string | number;
  materia: string;
  data: Date;
  oraInizio: string;
  oraFine: string;
  stato: 'disponibile' | 'occupato' | 'non_prenotabile';
  luogo: LuogoRicevimento;
}

export interface Documento {
  id: string;
  nomeFile: string;
  tipo: string;
  dimensione: number;
  dataCaricamento: string;
  percorso: string;
}

export interface Prenotazione {
  id: string ;
  studenteId: string;
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
export interface Bacheca {
  id: string ;
  messaggio: string;
  tipo: 'sistema' | 'ufficio' | 'стом';
  dataPubblicazione: string;
}

export interface FAQ {
  id: string | number;
  domanda: string;
  risposta: string;
  aperta: boolean;
  dataPubblicazione?: string;
}


