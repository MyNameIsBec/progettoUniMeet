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
const today = new Date();
today.setHours(0, 0, 0, 0);
const d = (offset: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  return dt;
};
async function main() {
  console.log('\n🌱 Seeding database...\n');
  console.log('🧹 Clearing existing database data...');
  await prisma.codiceVerifica.deleteMany();
  await prisma.giornoBloccato.deleteMany();
  await prisma.notifica.deleteMany();
  await prisma.documento.deleteMany();
  await prisma.prenotazione.deleteMany();
  await prisma.luogoRicevimento.deleteMany();
  await prisma.slotRicevimento.deleteMany();
  await prisma.segnalazione.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.bacheca.deleteMany();
  await prisma.corso.deleteMany();
  await prisma.docenteCorsoDiStudi.deleteMany();
  await prisma.amministratore.deleteMany();
  await prisma.studente.deleteMany();
  await prisma.docente.deleteMany();
  await prisma.corsoDiStudi.deleteMany();
  console.log('✨ Database cleared.\n');
  const PW = await bcrypt.hash('Password123!', SALT_ROUNDS);
  console.log('── CorsoDiStudi ──');
  const cds: Record<string, any> = {};
  for (const c of [
    { id: 'cds-1', nome: 'Informatica' },
    { id: 'cds-2', nome: 'Ingegneria Informatica' },
    { id: 'cds-3', nome: 'Matematica' },
  ]) {
    cds[c.id] = await prisma.corsoDiStudi.upsert({
      where: { id_corso_di_studi: c.id },
      update: {},
      create: { id_corso_di_studi: c.id, nome: c.nome },
    });
    console.log(`  ${c.nome}`);
  }
  console.log('\n── Studente ──');
  const studentData = [
    { mat: 'MAT001', nome: 'Mario', cognome: 'Rossi', email: 'mario.rossi@studenti.unimeet.it', cds: 'cds-1',
      notificheApp: true, notificheEmail: true, reminderOre: 24, tema: 'system', lingua: 'it' },
    { mat: 'MAT002', nome: 'Lisa', cognome: 'Bianchi', email: 'lisa.bianchi@studenti.unimeet.it', cds: 'cds-1',
      notificheApp: false, notificheEmail: true, reminderOre: 48, tema: 'chiaro', lingua: 'it' },
    { mat: 'MAT003', nome: 'Luca', cognome: 'Ferrari', email: 'luca.ferrari@studenti.unimeet.it', cds: 'cds-2',
      notificheApp: true, notificheEmail: false, reminderOre: 12, tema: 'scuro', lingua: 'en' },
    { mat: 'MAT004', nome: 'Sofia', cognome: 'Romano', email: 'sofia.romano@studenti.unimeet.it', cds: 'cds-1',
      notificheApp: true, notificheEmail: true, reminderOre: 24, tema: 'system', lingua: 'it' },
    { mat: 'MAT005', nome: 'Marco', cognome: 'Esposito', email: 'marco.esposito@studenti.unimeet.it', cds: 'cds-3',
      notificheApp: false, notificheEmail: false, reminderOre: 72, tema: 'chiaro', lingua: 'it' },
    { mat: 'MAT006', nome: 'Giulia', cognome: 'Conti', email: 'giulia.conti@studenti.unimeet.it', cds: 'cds-2',
      notificheApp: true, notificheEmail: true, reminderOre: 24, tema: 'system', lingua: 'it' },
  ];
  const studenti: Record<string, any> = {};
  for (const s of studentData) {
    studenti[s.mat] = await prisma.studente.upsert({
      where: { email: s.email },
      update: {},
      create: {
        matricola: s.mat, nome: s.nome, cognome: s.cognome, email: s.email, password: PW,
        id_corso_di_studi: cds[s.cds]!.id_corso_di_studi,
        notifiche_app: s.notificheApp, notifiche_email: s.notificheEmail,
        reminder_ore: s.reminderOre, tema: s.tema, lingua: s.lingua,
      },
    });
    console.log(`  ${s.mat} — ${s.nome} ${s.cognome} (${s.email})`);
  }
  console.log('\n── Docente ──');
  const docenteData = [
    { nome: 'Giuseppe', cognome: 'Verdi', email: 'giuseppe.verdi@unimeet.it', ufficio: 'Edificio D, Stanza 12',
      notificheApp: true, notificheEmail: true, reminderOre: 24, tema: 'system', lingua: 'it' },
    { nome: 'Anna', cognome: 'Neri', email: 'anna.neri@unimeet.it', ufficio: 'Edificio A, Stanza 5',
      notificheApp: true, notificheEmail: false, reminderOre: 12, tema: 'chiaro', lingua: 'it' },
    { nome: 'Maria', cognome: 'Bianco', email: 'maria.bianco@unimeet.it', ufficio: 'Edificio B, Stanza 8',
      notificheApp: false, notificheEmail: true, reminderOre: 48, tema: 'scuro', lingua: 'en' },
    { nome: 'Paolo', cognome: 'Russo', email: 'paolo.russo@unimeet.it', ufficio: 'Edificio C, Stanza 3',
      notificheApp: true, notificheEmail: true, reminderOre: 24, tema: 'system', lingua: 'it' },
    { nome: 'Elena', cognome: 'Colombo', email: 'elena.colombo@unimeet.it', ufficio: 'Edificio E, Stanza 10',
      notificheApp: true, notificheEmail: true, reminderOre: 24, tema: 'system', lingua: 'it' },
  ];
  const docenti: Record<string, any> = {};
  for (const d of docenteData) {
    docenti[d.email] = await prisma.docente.upsert({
      where: { email: d.email },
      update: {},
      create: {
        nome: d.nome, cognome: d.cognome, email: d.email, password: PW, ufficio: d.ufficio,
        notifiche_app: d.notificheApp, notifiche_email: d.notificheEmail,
        reminder_ore: d.reminderOre, tema: d.tema, lingua: d.lingua,
      },
    });
    console.log(`  ${d.nome} ${d.cognome} — ${d.ufficio}`);
  }
  console.log('\n── DocenteCorsoDiStudi ──');
  const associazioni = [
    { docente: 'giuseppe.verdi@unimeet.it', corsoDiStudi: 'cds-1' },
    { docente: 'giuseppe.verdi@unimeet.it', corsoDiStudi: 'cds-2' },
    { docente: 'anna.neri@unimeet.it', corsoDiStudi: 'cds-1' },
    { docente: 'maria.bianco@unimeet.it', corsoDiStudi: 'cds-2' },
    { docente: 'paolo.russo@unimeet.it', corsoDiStudi: 'cds-1' },
    { docente: 'paolo.russo@unimeet.it', corsoDiStudi: 'cds-2' },
    { docente: 'elena.colombo@unimeet.it', corsoDiStudi: 'cds-3' },
  ];
  for (const a of associazioni) {
    await prisma.docenteCorsoDiStudi.create({
      data: {
        id_docente: docenti[a.docente]!.id_docente,
        id_corso_di_studi: cds[a.corsoDiStudi]!.id_corso_di_studi,
      },
    });
    console.log(`  ${a.docente} → ${a.corsoDiStudi}`);
  }
  console.log('\n── Amministratore ──');
    const adminUsers = [
    { nome: 'Admin', email: 'admin@unimeet.it' },
  ];
  const adminCreati: any[] = [];
  for (const a of adminUsers) {
    const created = await prisma.amministratore.upsert({
      where: { email: a.email },
      update: {},
      create: { ...a, password: PW },
    });
    adminCreati.push(created);
    console.log(`  ${a.nome} (${a.email})`);
  }
  console.log('\n── Corso ──');
  const corsoData = [
    { id: 'corso-1', nome: 'Programmazione Web', anno: 2025, cfu: 9, docente: 'giuseppe.verdi@unimeet.it', cdsId: 'cds-1' },
    { id: 'corso-2', nome: 'Basi di Dati', anno: 2025, cfu: 9, docente: 'giuseppe.verdi@unimeet.it', cdsId: 'cds-1' },
    { id: 'corso-3', nome: 'Ingegneria del Software', anno: 2025, cfu: 6, docente: 'anna.neri@unimeet.it', cdsId: 'cds-1' },
    { id: 'corso-4', nome: 'Reti di Calcolatori', anno: 2025, cfu: 6, docente: 'maria.bianco@unimeet.it', cdsId: 'cds-2' },
    { id: 'corso-5', nome: 'Intelligenza Artificiale', anno: 2026, cfu: 9, docente: 'paolo.russo@unimeet.it', cdsId: 'cds-2' },
    { id: 'corso-6', nome: 'Analisi Matematica', anno: 2025, cfu: 12, docente: 'elena.colombo@unimeet.it', cdsId: 'cds-3' },
    { id: 'corso-7', nome: 'Geometria', anno: 2025, cfu: 9, docente: 'elena.colombo@unimeet.it', cdsId: 'cds-3' },
    { id: 'corso-8', nome: 'Sistemi Operativi', anno: 2026, cfu: 6, docente: 'paolo.russo@unimeet.it', cdsId: 'cds-2' },
    { id: 'corso-9', nome: 'Programmazione Avanzata', anno: 2025, cfu: 9, docente: 'giuseppe.verdi@unimeet.it', cdsId: 'cds-2' },
    { id: 'corso-10', nome: 'Fondamenti di Informatica', anno: 2025, cfu: 6, docente: 'paolo.russo@unimeet.it', cdsId: 'cds-1' },
  ];
  const corsi: Record<string, any> = {};
  for (const c of corsoData) {
    corsi[c.id] = await prisma.corso.upsert({
      where: { id_corso: c.id },
      update: {},
      create: {
        id_corso: c.id, nome_corso: c.nome, anno: c.anno, cfu: c.cfu,
        id_docente: docenti[c.docente]!.id_docente,
        id_corso_di_studi: cds[c.cdsId]!.id_corso_di_studi,
      },
    });
    console.log(`  ${c.nome} — ${c.cfu} CFU (${c.docente})`);
  }
  console.log('\n── Bacheca ──');
  const bachecaData = [
    { corsoId: 'corso-1', cdsId: 'cds-1', titolo: 'Bacheca - Programmazione Web', descrizione: 'Avvisi e materiale per il corso di Programmazione Web' },
    { corsoId: 'corso-2', cdsId: 'cds-1', titolo: 'Bacheca - Basi di Dati', descrizione: 'Avvisi e materiale per il corso di Basi di Dati' },
    { corsoId: 'corso-3', cdsId: 'cds-1', titolo: 'Bacheca - Ingegneria del Software', descrizione: 'Avvisi e materiale per il corso di Ingegneria del Software' },
    { corsoId: 'corso-4', cdsId: 'cds-2', titolo: 'Bacheca - Reti di Calcolatori', descrizione: 'Avvisi e materiale per il corso di Reti di Calcolatori' },
    { corsoId: 'corso-5', cdsId: 'cds-2', titolo: 'Bacheca - Intelligenza Artificiale', descrizione: 'Avvisi e materiale per il corso di Intelligenza Artificiale' },
    { corsoId: 'corso-6', cdsId: 'cds-3', titolo: 'Bacheca - Analisi Matematica', descrizione: 'Annunci e risorse per il corso di Analisi Matematica' },
    { corsoId: 'corso-7', cdsId: 'cds-3', titolo: 'Bacheca - Geometria', descrizione: 'Annunci e risorse per il corso di Geometria' },
    { corsoId: 'corso-9', cdsId: 'cds-2', titolo: 'Bacheca - Programmazione Avanzata', descrizione: 'Avvisi e materiale per il corso di Programmazione Avanzata' },
    { corsoId: 'corso-10', cdsId: 'cds-1', titolo: 'Bacheca - Fondamenti di Informatica', descrizione: 'Avvisi e materiale per il corso di Fondamenti di Informatica' },
  ];
  const bacheche: Record<string, any> = {};
  for (const b of bachecaData) {
    bacheche[b.corsoId] = await prisma.bacheca.create({
      data: {
        titolo: b.titolo, descrizione: b.descrizione,
        id_corso_di_studi: cds[b.cdsId]!.id_corso_di_studi,
        id_corso: corsi[b.corsoId]!.id_corso,
      },
    });
    console.log(`  ${b.titolo}`);
  }
  console.log('\n── FAQ ──');
  const faqList = [
    { domanda: "Come si svolge l'esame di Programmazione Web?", risposta: 'Prova pratica al computer e discussione orale.', corso: 'corso-1', docente: 'giuseppe.verdi@unimeet.it' },
    { domanda: 'Quali sono i libri di testo consigliati?', risposta: 'Dispense del corso e JavaScript: The Good Parts.', corso: 'corso-1', docente: 'giuseppe.verdi@unimeet.it' },
    { domanda: 'Ci sono appelli straordinari?', risposta: 'Sì, a marzo e novembre. Verificare il calendario.', corso: 'corso-1', docente: 'giuseppe.verdi@unimeet.it' },
    { domanda: 'SQL o NoSQL?', risposta: 'Entrambi. Il corso copre PostgreSQL e MongoDB.', corso: 'corso-2', docente: 'giuseppe.verdi@unimeet.it' },
    { domanda: 'Quali strumenti si usano per il versionamento?', risposta: 'Utilizziamo Git e GitHub per il controllo versione.', corso: 'corso-3', docente: 'anna.neri@unimeet.it' },
    { domanda: 'Come si svolge il progetto di Ingegneria del Software?', risposta: "Sviluppo di un'applicazione web in gruppo con metodologia Scrum.", corso: 'corso-3', docente: 'anna.neri@unimeet.it' },
    { domanda: 'Che argomenti copre Reti di Calcolatori?', risposta: 'Protocolli di rete, TCP/IP, routing, sicurezza e architetture client-server.', corso: 'corso-4', docente: 'maria.bianco@unimeet.it' },
    { domanda: "Come si ottiene l'esonero?", risposta: "Con una media del 27+ negli esami del primo semestre.", corso: 'corso-4', docente: 'maria.bianco@unimeet.it' },
    { domanda: 'Che linguaggio si usa per i progetti?', risposta: 'Python con TensorFlow e PyTorch.', corso: 'corso-5', docente: 'paolo.russo@unimeet.it' },
    { domanda: 'Come prenotare un ricevimento?', risposta: "Accedi all'area riservata e seleziona uno slot disponibile nel calendario del docente.", corso: 'corso-5', docente: 'paolo.russo@unimeet.it' },
    { domanda: 'Quando si tengono le esercitazioni?', risposta: 'Le esercitazioni di Analisi si tengono il martedì e giovedì mattina.', corso: 'corso-6', docente: 'elena.colombo@unimeet.it' },
    { domanda: "Quali sono i prerequisiti per l'esame di Geometria?", risposta: "Conoscenza di base dell'algebra lineare e della geometria analitica.", corso: 'corso-7', docente: 'elena.colombo@unimeet.it' },
    { domanda: 'Quali sono gli orari di ricevimento?', risposta: 'Il ricevimento si tiene il mercoledì dalle 15:00 alle 17:00.', corso: 'corso-5', docente: 'paolo.russo@unimeet.it' },
    { domanda: 'Quali linguaggi vengono usati per Programmazione Avanzata?', risposta: 'C++ e Java con focus su pattern di progettazione e architetture software.', corso: 'corso-9', docente: 'giuseppe.verdi@unimeet.it' },
    { domanda: 'È previsto un progetto finale?', risposta: 'Sì, un progetto a gruppi su un\'applicazione distribuita con documentazione tecnica.', corso: 'corso-9', docente: 'giuseppe.verdi@unimeet.it' },
    { domanda: 'Che prerequisiti servono per Fondamenti di Informatica?', risposta: 'Nessun prerequisito formale, il corso parte da zero con Python.', corso: 'corso-10', docente: 'paolo.russo@unimeet.it' },
    { domanda: 'Come si svolge l\'esame?', risposta: 'Prova scritta con esercizi di programmazione e domande di teoria.', corso: 'corso-10', docente: 'paolo.russo@unimeet.it' },
  ];
  console.log('\n✅ Seed completato con successo!');
  console.log(`   - ${studentData.length} studenti (MAT006 senza prenotazioni)`);
  console.log(`   - ${docenteData.length} docenti`);
  console.log(`   - 0 documenti preimpostati`);
}
main()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
