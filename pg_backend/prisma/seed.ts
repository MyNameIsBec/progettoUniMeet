import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Seeding database...\n');

  const PW = await bcrypt.hash('password123', SALT_ROUNDS);

  // ──────────────────────────── STUDENTE ────────────────────────────
  console.log('── Studente ──');
  const studenti = [
    { matricola: 'MAT001', nome: 'Mario', cognome: 'Rossi', email: 'mario.rossi@studenti.unime.it', corso: 'Informatica' },
    { matricola: 'MAT002', nome: 'Lisa', cognome: 'Bianchi', email: 'lisa.bianchi@studenti.unime.it', corso: 'Informatica' },
    { matricola: 'MAT003', nome: 'Luca', cognome: 'Ferrari', email: 'luca.ferrari@studenti.unime.it', corso: 'Ingegneria Informatica' },
    { matricola: 'MAT004', nome: 'Sofia', cognome: 'Romano', email: 'sofia.romano@studenti.unime.it', corso: 'Informatica' },
    { matricola: 'MAT005', nome: 'Marco', cognome: 'Esposito', email: 'marco.esposito@studenti.unime.it', corso: 'Matematica' },
  ];
  const studentiCreati: Record<string, any> = {};
  for (const s of studenti) {
    studentiCreati[s.matricola] = await prisma.studente.upsert({
      where: { email: s.email },
      update: {},
      create: { matricola: s.matricola, nome: s.nome, cognome: s.cognome, email: s.email, password: PW, corso_di_studi: s.corso },
    });
    console.log(`  ${s.matricola} — ${s.nome} ${s.cognome} (${s.corso})`);
  }

  // ──────────────────────────── DOCENTE ────────────────────────────
  console.log('\n── Docente ──');
  const docenti = [
    { nome: 'Giuseppe', cognome: 'Verdi', email: 'giuseppe.verdi@unime.it', ufficio: 'Edificio D, Stanza 12' },
    { nome: 'Anna', cognome: 'Neri', email: 'anna.neri@unime.it', ufficio: 'Edificio A, Stanza 5' },
    { nome: 'Maria', cognome: 'Bianco', email: 'maria.bianco@unime.it', ufficio: 'Edificio B, Stanza 8' },
    { nome: 'Paolo', cognome: 'Russo', email: 'paolo.russo@unime.it', ufficio: 'Edificio C, Stanza 3' },
  ];
  const docentiCreati: Record<string, any> = {};
  for (const d of docenti) {
    docentiCreati[d.email] = await prisma.docente.upsert({
      where: { email: d.email },
      update: {},
      create: { ...d, password: PW },
    });
    console.log(`  ${d.nome} ${d.cognome} — ${d.ufficio}`);
  }

  // ──────────────────────────── AMMINISTRATORE ────────────────────────────
  console.log('\n── Amministratore ──');
  const adminData = [
    { nome: 'Admin', email: 'admin@unime.it' },
    { nome: 'Super Admin', email: 'superadmin@unime.it' },
  ];
  for (const a of adminData) {
    await prisma.amministratore.upsert({
      where: { email: a.email },
      update: {},
      create: { ...a, password: PW },
    });
    console.log(`  ${a.nome} (${a.email})`);
  }

  // ──────────────────────────── CORSO ────────────────────────────
  console.log('\n── Corso ──');
  const corsi = [
    { id: 'corso-1', nome: 'Programmazione Web', anno: 2025, cfu: 9, docente: 'giuseppe.verdi@unime.it' },
    { id: 'corso-2', nome: 'Basi di Dati', anno: 2025, cfu: 9, docente: 'giuseppe.verdi@unime.it' },
    { id: 'corso-3', nome: 'Ingegneria del Software', anno: 2025, cfu: 6, docente: 'anna.neri@unime.it' },
    { id: 'corso-4', nome: 'Reti di Calcolatori', anno: 2025, cfu: 6, docente: 'maria.bianco@unime.it' },
    { id: 'corso-5', nome: 'Intelligenza Artificiale', anno: 2026, cfu: 9, docente: 'paolo.russo@unime.it' },
  ];
  const corsiCreati: Record<string, any> = {};
  for (const c of corsi) {
    const doc = docentiCreati[c.docente]!;
    corsiCreati[c.id] = await prisma.corso.upsert({
      where: { id_corso: c.id },
      update: {},
      create: { id_corso: c.id, nome_corso: c.nome, anno: c.anno, cfu: c.cfu, id_docente: doc.id_docente },
    });
    console.log(`  ${c.nome} — ${c.cfu} CFU (${c.docente})`);
  }

  // ──────────────────────────── BACHECA ────────────────────────────
  console.log('\n── Bacheca ──');
  const bacheche = [
    { titolo: 'Bacheca di Programmazione Web', descrizione: 'Avvisi e materiale per il corso di Programmazione Web', corso: 'corso-1' },
    { titolo: 'Bacheca di Basi di Dati', descrizione: 'Avvisi e materiale per il corso di Basi di Dati', corso: 'corso-2' },
    { titolo: 'Bacheca di Intelligenza Artificiale', descrizione: 'Annunci e risorse per il corso di IA', corso: 'corso-5' },
  ];
  const bachecheCreati: Record<string, any> = {};
  for (const b of bacheche) {
    bachecheCreati[b.corso] = await prisma.bacheca.upsert({
      where: { id_corso: corsiCreati[b.corso]!.id_corso },
      update: {},
      create: { titolo: b.titolo, descrizione: b.descrizione, id_corso: corsiCreati[b.corso]!.id_corso },
    });
    console.log(`  ${b.titolo}`);
  }

  // ──────────────────────────── FAQ ────────────────────────────
  console.log('\n── FAQ ──');
  const faqList = [
    { domanda: "Come si svolge l'esame?", risposta: 'Prova pratica al computer e discussione orale.', bacheca: 'corso-1' },
    { domanda: 'Ci sono appelli straordinari?', risposta: 'Sì, a marzo e novembre. Verificare il calendario.', bacheca: 'corso-1' },
    { domanda: 'Quali sono i libri di testo consigliati?', risposta: 'Dispense del corso e JavaScript: The Good Parts.', bacheca: 'corso-1' },
    { domanda: 'Come si ottiene l\'esonero?', risposta: 'Con una media del 27+ negli esami del primo semestre.', bacheca: 'corso-2' },
    { domanda: 'SQL o NoSQL?', risposta: 'Entrambi. Il corso copre PostgreSQL e MongoDB.', bacheca: 'corso-2' },
    { domanda: 'Che linguaggio si usa per i progetti?', risposta: 'Python con TensorFlow e PyTorch.', bacheca: 'corso-5' },
  ];
  for (const f of faqList) {
    const faq = await prisma.fAQ.create({
      data: { domanda: f.domanda, risposta: f.risposta, id_bacheca: bachecheCreati[f.bacheca]!.id_bacheca },
    });
    console.log(`  Q: ${faq.domanda}`);
  }

  // ──────────────────────────── SLOT RICEVIMENTO ────────────────────────────
  console.log('\n── SlotRicevimento ──');
  const slotData = [
    { data: '2026-05-15', inizio: '10:00', fine: '11:00', disp: true, docente: 'giuseppe.verdi@unime.it' },
    { data: '2026-05-15', inizio: '11:00', fine: '12:00', disp: true, docente: 'giuseppe.verdi@unime.it' },
    { data: '2026-05-18', inizio: '14:00', fine: '15:30', disp: true, docente: 'anna.neri@unime.it' },
    { data: '2026-05-20', inizio: '09:00', fine: '10:00', disp: false, docente: 'maria.bianco@unime.it' },
    { data: '2026-05-22', inizio: '15:00', fine: '16:00', disp: true, docente: 'paolo.russo@unime.it' },
    { data: '2026-05-22', inizio: '16:00', fine: '17:00', disp: true, docente: 'paolo.russo@unime.it' },
  ];
  const slotsCreati: any[] = [];
  for (const s of slotData) {
    const doc = docentiCreati[s.docente]!;
    const slot = await prisma.slotRicevimento.create({
      data: {
        data: new Date(s.data),
        ora_inizio: new Date(`${s.data}T${s.inizio}`),
        ora_fine: new Date(`${s.data}T${s.fine}`),
        disponibilita: s.disp,
        id_docente: doc.id_docente,
      },
    });
    slotsCreati.push(slot);
    console.log(`  ${s.data} ${s.inizio}-${s.fine} — ${s.docente} (${s.disp ? 'libero' : 'occupato'})`);
  }

  // ──────────────────────────── LUOGO RICEVIMENTO ────────────────────────────
  console.log('\n── LuogoRicevimento ──');
  const luoghi = [
    { aula: 'Aula 5', edificio: 'Edificio D', piano: 'Primo piano', lat: 38.1938, lon: 15.5540, slot: slotsCreati[0]! },
    { aula: 'Studio 12', edificio: 'Edificio A', piano: 'Secondo piano', lat: 38.1940, lon: 15.5535, slot: slotsCreati[2]! },
    { aula: 'Lab 3', edificio: 'Edificio C', piano: 'Piano terra', lat: 38.1935, lon: 15.5545, slot: slotsCreati[4]! },
  ];
  for (const l of luoghi) {
    await prisma.luogoRicevimento.create({
      data: { nome_aula: l.aula, edificio: l.edificio, piano: l.piano, latitudine: l.lat, longitudine: l.lon, id_slot: l.slot.id_slot },
    });
    console.log(`  ${l.aula} — ${l.edificio}, ${l.piano}`);
  }

  // ──────────────────────────── PRENOTAZIONE ────────────────────────────
  console.log('\n── Prenotazione ──');
  const prenotazioni = [
    { argomento: 'Discussione progetto esame', stato: 'CONFERMATO', studente: 'MAT001', slot: slotsCreati[0]! },
    { argomento: 'Chiarimenti su esercizi SQL', stato: 'IN_ATTESA', studente: 'MAT002', slot: slotsCreati[1]! },
    { argomento: 'Orientamento tesi triennale', stato: 'CONFERMATO', studente: 'MAT003', slot: slotsCreati[2]! },
    { argomento: 'Richiesta lettera di referenza', stato: 'RIFIUTATO', studente: 'MAT004', slot: slotsCreati[3]! },
    { argomento: 'Consigli su percorso studi', stato: 'IN_ATTESA', studente: 'MAT005', slot: slotsCreati[4]! },
  ];
  const prenotazioniCreati: any[] = [];
  for (const p of prenotazioni) {
    const pren = await prisma.prenotazione.create({
      data: {
        argomento: p.argomento,
        stato_prenotazione: p.stato,
        matricola_studente: p.studente,
        id_slot: p.slot.id_slot,
      },
    });
    prenotazioniCreati.push(pren);
    console.log(`  ${p.argomento} — ${p.studente} [${p.stato}]`);
  }

  // ──────────────────────────── DOCUMENTO ────────────────────────────
  console.log('\n── Documento ──');
  const documenti = [
    { file: 'relazione_progetto.pdf', tipo: 'application/pdf', dim: 2048000, percorso: '/uploads/relazione_progetto.pdf', prenotazione: prenotazioniCreati[0]! },
    { file: 'esercizi_sql.zip', tipo: 'application/zip', dim: 512000, percorso: '/uploads/esercizi_sql.zip', prenotazione: prenotazioniCreati[3]! },
    { file: 'lettera_motivazionale.docx', tipo: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', dim: 128000, percorso: '/uploads/lettera_motivazionale.docx', prenotazione: prenotazioniCreati[2]! },
  ];
  for (const d of documenti) {
    await prisma.documento.create({
      data: {
        nome_file: d.file,
        tipo_file: d.tipo,
        dimensione: d.dim,
        percorso_file: d.percorso,
        id_prenotazione: d.prenotazione.id_prenotazione,
      },
    });
    console.log(`  ${d.file} (${(d.dim / 1024).toFixed(0)} KB)`);
  }

  // ──────────────────────────── NOTIFICA ────────────────────────────
  console.log('\n── Notifica ──');
  const notifiche = [
    { msg: 'La prenotazione per il ricevimento del 15/05/2026 è stata confermata.', tipo: 'CONFERMA_PRENOTAZIONE' },
    { msg: 'Nuovo materiale didattico disponibile per Programmazione Web.', tipo: 'AVVISO_CORSO' },
    { msg: 'La prenotazione per il ricevimento del 18/05/2026 è stata rifiutata.', tipo: 'RIFIUTO_PRENOTAZIONE' },
    { msg: 'Le date degli appelli estivi sono state pubblicate.', tipo: 'AVVISO_GENERALE' },
    { msg: 'Ricevimento del 22/05 annullato per impegni istituzionali.', tipo: 'CANCELLAZIONE_SLOT' },
  ];
  for (const n of notifiche) {
    await prisma.notifica.create({
      data: { messaggio: n.msg, tipo: n.tipo },
    });
    console.log(`  [${n.tipo}] ${n.msg.substring(0, 60)}...`);
  }

  console.log('\n✅ Seed completato con successo!');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
