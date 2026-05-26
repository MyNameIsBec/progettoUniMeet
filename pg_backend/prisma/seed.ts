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

  // Pulizia preliminare per rendere il seed riproducibile
  console.log('🧹 Clearing existing database data...');
  await prisma.codiceVerifica.deleteMany({});
  await prisma.giornoBloccato.deleteMany({});
  await prisma.notifica.deleteMany({});
  await prisma.documento.deleteMany({});
  await prisma.prenotazione.deleteMany({});
  await prisma.luogoRicevimento.deleteMany({});
  await prisma.slotRicevimento.deleteMany({});
  await prisma.segnalazione.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.bacheca.deleteMany({});
  await prisma.corso.deleteMany({});
  await prisma.docenteCorsoDiStudi.deleteMany({});
  await prisma.amministratore.deleteMany({});
  await prisma.studente.deleteMany({});
  await prisma.docente.deleteMany({});
  await prisma.corsoDiStudi.deleteMany({});
  console.log('✨ Database cleared.\n');

  const PW = await bcrypt.hash('password123', SALT_ROUNDS);

  // ──────────────────────────── CORSO DI STUDI ────────────────────────────
  console.log('── CorsoDiStudi ──');
  const corsiDiStudi: Record<string, any> = {};
  const cdsList = [
    { id: 'cds-1', nome: 'Informatica' },
    { id: 'cds-2', nome: 'Ingegneria Informatica' },
    { id: 'cds-3', nome: 'Matematica' },
  ];
  for (const c of cdsList) {
    corsiDiStudi[c.id] = await prisma.corsoDiStudi.upsert({
      where: { id_corso_di_studi: c.id },
      update: {},
      create: { id_corso_di_studi: c.id, nome: c.nome },
    });
    console.log(`  ${c.nome}`);
  }

  // ──────────────────────────── STUDENTE ────────────────────────────
  console.log('\n── Studente ──');
  const studenti = [
    { matricola: 'MAT001', nome: 'Mario', cognome: 'Rossi', email: 'mario.rossi@studenti.unime.it', corsoDiStudi: 'cds-1' },
    { matricola: 'MAT002', nome: 'Lisa', cognome: 'Bianchi', email: 'lisa.bianchi@studenti.unime.it', corsoDiStudi: 'cds-1' },
    { matricola: 'MAT003', nome: 'Luca', cognome: 'Ferrari', email: 'luca.ferrari@studenti.unime.it', corsoDiStudi: 'cds-2' },
    { matricola: 'MAT004', nome: 'Sofia', cognome: 'Romano', email: 'sofia.romano@studenti.unime.it', corsoDiStudi: 'cds-1' },
    { matricola: 'MAT005', nome: 'Marco', cognome: 'Esposito', email: 'marco.esposito@studenti.unime.it', corsoDiStudi: 'cds-3' },
  ];
  const studentiCreati: Record<string, any> = {};
  for (const s of studenti) {
    studentiCreati[s.matricola] = await prisma.studente.upsert({
      where: { email: s.email },
      update: {},
      create: {
        matricola: s.matricola, nome: s.nome, cognome: s.cognome, email: s.email, password: PW,
        id_corso_di_studi: corsiDiStudi[s.corsoDiStudi]!.id_corso_di_studi,
      },
    });
    console.log(`  ${s.matricola} — ${s.nome} ${s.cognome}`);
  }

  // ──────────────────────────── DOCENTE ────────────────────────────
  console.log('\n── Docente ──');
  const docenti = [
    { nome: 'Giuseppe', cognome: 'Verdi', email: 'giuseppe.verdi@unime.it', ufficio: 'Edificio D, Stanza 12' },
    { nome: 'Anna', cognome: 'Neri', email: 'anna.neri@unime.it', ufficio: 'Edificio A, Stanza 5' },
    { nome: 'Maria', cognome: 'Bianco', email: 'maria.bianco@unime.it', ufficio: 'Edificio B, Stanza 8' },
    { nome: 'Paolo', cognome: 'Russo', email: 'paolo.russo@unime.it', ufficio: 'Edificio C, Stanza 3' },
    { nome: 'Elena', cognome: 'Colombo', email: 'elena.colombo@unime.it', ufficio: 'Edificio E, Stanza 10' },
  ];
  const docentiCreati: Record<string, any> = {};
  for (const d of docenti) {
    docentiCreati[d.email] = await prisma.docente.upsert({
      where: { email: d.email },
      update: {},
      create: { nome: d.nome, cognome: d.cognome, email: d.email, password: PW, ufficio: d.ufficio },
    });
    console.log(`  ${d.nome} ${d.cognome} — ${d.ufficio}`);
  }

  // ──────────────────────────── DOCENTE CORSO DI STUDI ────────────────────────────
  console.log('\n── DocenteCorsoDiStudi ──');
  const associazioni = [
    { docente: 'giuseppe.verdi@unime.it', corsoDiStudi: 'cds-1' },
    { docente: 'giuseppe.verdi@unime.it', corsoDiStudi: 'cds-2' },
    { docente: 'anna.neri@unime.it', corsoDiStudi: 'cds-1' },
    { docente: 'maria.bianco@unime.it', corsoDiStudi: 'cds-2' },
    { docente: 'paolo.russo@unime.it', corsoDiStudi: 'cds-1' },
    { docente: 'paolo.russo@unime.it', corsoDiStudi: 'cds-2' },
    { docente: 'elena.colombo@unime.it', corsoDiStudi: 'cds-3' },
  ];
  for (const a of associazioni) {
    await prisma.docenteCorsoDiStudi.create({
      data: {
        id_docente: docentiCreati[a.docente]!.id_docente,
        id_corso_di_studi: corsiDiStudi[a.corsoDiStudi]!.id_corso_di_studi,
      },
    });
    console.log(`  ${a.docente} → ${a.corsoDiStudi}`);
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
    { id: 'corso-1', nome: 'Programmazione Web', anno: 2025, cfu: 9, docente: 'giuseppe.verdi@unime.it', corsoDiStudi: 'cds-1' },
    { id: 'corso-2', nome: 'Basi di Dati', anno: 2025, cfu: 9, docente: 'giuseppe.verdi@unime.it', corsoDiStudi: 'cds-1' },
    { id: 'corso-3', nome: 'Ingegneria del Software', anno: 2025, cfu: 6, docente: 'anna.neri@unime.it', corsoDiStudi: 'cds-1' },
    { id: 'corso-4', nome: 'Reti di Calcolatori', anno: 2025, cfu: 6, docente: 'maria.bianco@unime.it', corsoDiStudi: 'cds-2' },
    { id: 'corso-5', nome: 'Intelligenza Artificiale', anno: 2026, cfu: 9, docente: 'paolo.russo@unime.it', corsoDiStudi: 'cds-2' },
    { id: 'corso-6', nome: 'Analisi Matematica', anno: 2025, cfu: 12, docente: 'elena.colombo@unime.it', corsoDiStudi: 'cds-3' },
    { id: 'corso-7', nome: 'Geometria', anno: 2025, cfu: 9, docente: 'elena.colombo@unime.it', corsoDiStudi: 'cds-3' },
  ];
  const corsiCreati: Record<string, any> = {};
  for (const c of corsi) {
    const doc = docentiCreati[c.docente]!;
    corsiCreati[c.id] = await prisma.corso.upsert({
      where: { id_corso: c.id },
      update: {},
      create: {
        id_corso: c.id, nome_corso: c.nome, anno: c.anno, cfu: c.cfu,
        id_docente: doc.id_docente,
        id_corso_di_studi: corsiDiStudi[c.corsoDiStudi]!.id_corso_di_studi,
      },
    });
    console.log(`  ${c.nome} — ${c.cfu} CFU (${c.docente}) → ${c.corsoDiStudi}`);
  }

  // ──────────────────────────── BACHECA ────────────────────────────
  console.log('\n── Bacheca ──');
  const bacheche = [
    { titolo: 'Bacheca di Informatica', descrizione: 'Avvisi e materiale per il Corso di Studi in Informatica', corsoDiStudi: 'cds-1' },
    { titolo: 'Bacheca di Ingegneria Informatica', descrizione: 'Avvisi e materiale per il Corso di Studi in Ingegneria Informatica', corsoDiStudi: 'cds-2' },
    { titolo: 'Bacheca di Matematica', descrizione: 'Annunci e risorse per il Corso di Studi in Matematica', corsoDiStudi: 'cds-3' },
  ];
  const bachecheCreati: Record<string, any> = {};
  for (const b of bacheche) {
    bachecheCreati[b.corsoDiStudi] = await prisma.bacheca.upsert({
      where: { id_corso_di_studi: corsiDiStudi[b.corsoDiStudi]!.id_corso_di_studi },
      update: {},
      create: {
        titolo: b.titolo, descrizione: b.descrizione,
        id_corso_di_studi: corsiDiStudi[b.corsoDiStudi]!.id_corso_di_studi,
      },
    });
    console.log(`  ${b.titolo}`);
  }

  // ──────────────────────────── FAQ ────────────────────────────
  console.log('\n── FAQ ──');
  const faqList = [
    { domanda: "Come si svolge l'esame?", risposta: 'Prova pratica al computer e discussione orale.', bacheca: 'cds-1', docente: 'giuseppe.verdi@unime.it' },
    { domanda: 'Ci sono appelli straordinari?', risposta: 'Sì, a marzo e novembre. Verificare il calendario.', bacheca: 'cds-1', docente: 'giuseppe.verdi@unime.it' },
    { domanda: 'SQL o NoSQL?', risposta: 'Entrambi. Il corso copre PostgreSQL e MongoDB.', bacheca: 'cds-1', docente: 'giuseppe.verdi@unime.it' },
    { domanda: 'Quali strumenti si usano per il versionamento?', risposta: 'Utilizziamo Git e GitHub per il controllo versione. Durante il corso vengono fornite le guide per l\'uso.', bacheca: 'cds-1', docente: 'anna.neri@unime.it' },
    { domanda: 'Come si svolge il progetto di Ingegneria del Software?', risposta: 'Il progetto prevede lo sviluppo di un\'applicazione web in gruppo, seguendo la metodologia Scrum.', bacheca: 'cds-1', docente: 'anna.neri@unime.it' },
    { domanda: 'Come prenotare un ricevimento?', risposta: 'Accedi all\'area riservata e seleziona uno slot disponibile nel calendario del docente.', bacheca: 'cds-1', docente: 'paolo.russo@unime.it' },
    { domanda: 'Quali sono i libri di testo consigliati?', risposta: 'Dispense del corso e JavaScript: The Good Parts.', bacheca: 'cds-2', docente: 'giuseppe.verdi@unime.it' },
    { domanda: "Come si ottiene l'esonero?", risposta: "Con una media del 27+ negli esami del primo semestre.", bacheca: 'cds-2', docente: 'maria.bianco@unime.it' },
    { domanda: 'Che linguaggio si usa per i progetti?', risposta: 'Python con TensorFlow e PyTorch.', bacheca: 'cds-2', docente: 'paolo.russo@unime.it' },
    { domanda: 'Che argomenti copre Reti di Calcolatori?', risposta: 'Il corso copre protocolli di rete, TCP/IP, routing, sicurezza di rete e architetture client-server.', bacheca: 'cds-2', docente: 'maria.bianco@unime.it' },
    { domanda: 'Quando si tengono le esercitazioni?', risposta: 'Le esercitazioni di Analisi si tengono il martedì e giovedì mattina.', bacheca: 'cds-3', docente: 'elena.colombo@unime.it' },
    { domanda: "Quali sono i prerequisiti per l'esame di Geometria?", risposta: 'È richiesta la conoscenza di base dell\'algebra lineare e della geometria analitica.', bacheca: 'cds-3', docente: 'elena.colombo@unime.it' },
  ];
  for (const f of faqList) {
    const faq = await prisma.fAQ.create({
      data: {
        domanda: f.domanda,
        risposta: f.risposta,
        id_bacheca: bachecheCreati[f.bacheca]!.id_bacheca,
        id_docente: docentiCreati[f.docente]!.id_docente,
      },
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
    { argomento: 'Discussione progetto esame', stato: 'CONFERMATA', studente: 'MAT001', slot: slotsCreati[0]! },
    { argomento: 'Chiarimenti su esercizi SQL', stato: 'IN_ATTESA', studente: 'MAT002', slot: slotsCreati[1]! },
    { argomento: 'Orientamento tesi triennale', stato: 'CONFERMATA', studente: 'MAT003', slot: slotsCreati[2]! },
    { argomento: 'Richiesta lettera di referenza', stato: 'RIFIUTATA', studente: 'MAT004', slot: slotsCreati[3]! },
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

  // ──────────────────────────── SEGNALAZIONE ────────────────────────────
  console.log('\n── Segnalazione ──');
  const segnalazioni = [
    { oggetto: 'Errore nel caricamento documento', descrizione: 'Quando provo a caricare un PDF per la prenotazione del 15/05, ricevo un errore 500.', stato: 'APERTA', studente: 'MAT001' },
    { oggetto: 'Slot non visibili nel calendario', descrizione: 'Non riesco a vedere gli slot del Prof. Verdi per la prossima settimana.', stato: 'IN_LAVORAZIONE', studente: 'MAT002' },
    { oggetto: 'Notifica di conferma non ricevuta', descrizione: 'La prenotazione del 18/05 è stata confermata ma non ho ricevuto la notifica.', stato: 'APERTA', studente: 'MAT003' },
    { oggetto: 'Problema accesso area personale', descrizione: 'Dopo il login vengo reindirizzato alla home invece che alla dashboard.', stato: 'CHIUSA', studente: 'MAT004' },
    { oggetto: 'Richiesta chiarimenti esonero', descrizione: 'Vorrei maggiori informazioni sulle modalità di esonero per Basi di Dati.', stato: 'CHIUSA', studente: 'MAT005' },
    { oggetto: "Errore modifica profilo", descrizione: "Quando provo ad aggiornare il mio corso di studi, il sistema non salva le modifiche.", stato: 'APERTA', studente: 'MAT001' },
    { oggetto: 'Doppia prenotazione involontaria', descrizione: 'Ho prenotato due volte lo stesso slot per errore. Come posso cancellarne una?', stato: 'IN_LAVORAZIONE', studente: 'MAT003' },
    { oggetto: 'Documento allegato non visualizzato', descrizione: 'Il file caricato per la prenotazione del 22/05 non viene mostrato nella schermata di dettaglio.', stato: 'IN_LAVORAZIONE', studente: 'MAT002' },
  ];
  for (const s of segnalazioni) {
    await prisma.segnalazione.create({
      data: {
        oggetto: s.oggetto,
        descrizione: s.descrizione,
        stato: s.stato,
        matricola_studente: s.studente,
      },
    });
    console.log(`  [${s.stato}] ${s.oggetto} — ${s.studente}`);
  }

  // ──────────────────────────── GIORNI BLOCCATI ────────────────────────────
  console.log('\n── GiornoBloccato ──');
  const giorniBloccati = [
    { data: '2026-04-25', motivo: 'Festa della Liberazione' },
    { data: '2026-05-01', motivo: 'Festa del Lavoro' },
    { data: '2026-06-02', motivo: 'Festa della Repubblica' },
  ];
  for (const g of giorniBloccati) {
    await prisma.giornoBloccato.upsert({
      where: { data: new Date(g.data) },
      update: {},
      create: { data: new Date(g.data), motivo: g.motivo },
    });
    console.log(`  ${g.data} — ${g.motivo}`);
  }

  // ──────────────────────────── NOTIFICA ────────────────────────────
  console.log('\n── Notifica ──');

  const notificheStudente = [
    { titolo: 'Conferma Ricevimento', msg: 'Il ricevimento del 15/05/2026 con il Prof. Verdi è stato confermato.', tipo: 'CONFERMA' },
    { titolo: 'Nuovo Materiale', msg: 'Nuovo materiale didattico disponibile per Programmazione Web.', tipo: 'AVVISO_CORSO' },
    { titolo: 'Ricevimento Rifiutato', msg: 'La richiesta di ricevimento per il 18/05/2026 è stata rifiutata.', tipo: 'RIFIUTO' },
    { titolo: 'Appelli Estivi', msg: 'Le date degli appelli estivi sono state pubblicate.', tipo: 'AVVISO_GENERALE' },
    { titolo: 'Slot Annullato', msg: 'Il ricevimento del 22/05/2026 è stato annullato.', tipo: 'CANCELLAZIONE' },
  ];
  for (const n of notificheStudente) {
    await prisma.notifica.create({
      data: { titolo: n.titolo, messaggio: n.msg, tipo: n.tipo, destinatario_id: 'MAT001', destinatario_ruolo: 'STUDENTE' },
    });
    console.log(`  [STUDENTE] ${n.titolo}`);
  }

  const docente = await prisma.docente.findFirst();
  if (docente) {
    const notificheDocente = [
      { titolo: 'Nuova Prenotazione', msg: 'Lo studente Mario Rossi ha prenotato un ricevimento per il 15/05/2026.', tipo: 'NUOVA_PRENOTAZIONE' },
      { titolo: 'Promemoria Ricevimento', msg: 'Hai un ricevimento con uno studente domani alle 10:00.', tipo: 'PROMEMORIA' },
    ];
    for (const n of notificheDocente) {
      await prisma.notifica.create({
        data: { titolo: n.titolo, messaggio: n.msg, tipo: n.tipo, destinatario_id: docente.id_docente, destinatario_ruolo: 'DOCENTE' },
      });
      console.log(`  [DOCENTE] ${n.titolo}`);
    }
  }

  const admin = await prisma.amministratore.findFirst();
  if (admin) {
    const notificheAdmin = [
      { titolo: 'Nuova Segnalazione', msg: 'È stata aperta una nuova segnalazione da uno studente.', tipo: 'SEGNALAZIONE' },
      { titolo: 'Report Settimanale', msg: 'Il report settimanale delle prenotazioni è disponibile.', tipo: 'SISTEMA' },
    ];
    for (const n of notificheAdmin) {
      await prisma.notifica.create({
        data: { titolo: n.titolo, messaggio: n.msg, tipo: n.tipo, destinatario_id: admin.id_admin, destinatario_ruolo: 'AMMINISTRATORE' },
      });
      console.log(`  [AMMINISTRATORE] ${n.titolo}`);
    }
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
