export interface Studente {
  matricola: string;
  nome: string;
  cognome: string;
  email: string;
  corsoDiStudi: string;
}

export interface Docente {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  ufficio: string;
  corsi: Corso[];
}

export interface Corso {
  id: string;
  nome: string;
  cfu: number;
  anno: number;
  bachecaId:string;
}

export interface Amministratore {
  id: string;
  nome: string;
  email: string;
  password: string;
}

