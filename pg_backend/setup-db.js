#!/usr/bin/env node
const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const path = require('path');
const { Client } = require('pg');

const SCRIPT_DIR = path.dirname(process.argv[1]);
const MAINTENANCE_DBS = ['postgres', 'template1'];

function ok(msg)  { console.log(`\x1b[32m✅\x1b[0m ${msg}`); }
function info(msg){ console.log(`\x1b[33mℹ️ \x1b[0m${msg}`); }
function fail(msg){ console.log(`\x1b[31m❌\x1b[0m ${msg}`); }
function code(cmd){ console.log(`  \x1b[90m$\x1b[0m ${cmd}`); }
function hint(msg){ console.log(`  \x1b[90m💡\x1b[0m ${msg}`); }

function run(cmd, opts = {}) {
  try {
    execSync(cmd, { stdio: 'inherit', cwd: SCRIPT_DIR, ...opts });
  } catch {
    process.exit(1);
  }
}

function tryRun(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).toString().trim();
  } catch {
    return null;
  }
}

const PG_ERROR_CODES = {
  '28P01': 'Autenticazione fallita — password errata o metodo md5/scram non abilitato per connessioni TCP.',
  '3D000': 'Database di manutenzione non trovato.',
  'ECONNREFUSED': 'Connessione rifiutata — PostgreSQL non in ascolto o porta sbagliata.',
  'ETIMEOUT': 'Timeout di connessione — firewall o rete bloccano la porta 5432.',
  'ENOTFOUND': 'Host non trovato.',
  'EACCES': 'Permesso negato.',
};

function checkPgService() {
  const plat = process.platform;
  if (plat === 'win32') {
    const out = tryRun('sc query state= all | findstr /i "postgres"');
    if (out) {
      const lines = out.split('\n').filter(l => l.trim());
      if (lines.length > 0) {
        info(`Servizi PostgreSQL trovati:`);
        for (const l of lines) {
          const nameMatch = l.match(/SERVICE_NAME:\s*(\S+)/);
          const stateMatch = tryRun(`sc query "${nameMatch ? nameMatch[1] : ''}" | findstr /i "STATE"`);
          const running = stateMatch && stateMatch.includes('RUNNING');
          console.log(`     ${nameMatch ? nameMatch[1] : l.trim()} — ${running ? '🟢 in esecuzione' : '🔴 fermo'}`);
        }
      }
    } else {
      fail('Nessun servizio PostgreSQL trovato.');
      hint('Installa PostgreSQL da: https://www.postgresql.org/download/windows/');
      return false;
    }
    return true;
  }
  if (plat === 'darwin') {
    const out = tryRun('brew services list 2>/dev/null | grep postgres');
    if (out && out.includes('started')) {
      ok('PostgreSQL (Homebrew) in esecuzione');
      return true;
    }
    info('PostgreSQL via Homebrew potrebbe non essere in esecuzione.');
    return null;
  }
  // Linux
  const out = tryRun('pg_isready -q 2>/dev/null');
  if (out !== null) {
    ok('PostgreSQL raggiungibile (pg_isready)');
    return true;
  }
  const sysctl = tryRun('systemctl is-active postgresql 2>/dev/null');
  if (sysctl === 'active') {
    ok('Servizio postgresql attivo');
    return true;
  }
  return null;
}

function loadEnv(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const match = raw.match(/^DATABASE_URL=["']?([^\s"']+)["']?/m);
  if (!match) throw new Error('DATABASE_URL non trovata in .env');
  return match[1];
}

function parseDbUrl(urlStr) {
  const url = new URL(urlStr);
  return {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    dbName: url.pathname.replace(/^\//, ''),
  };
}

async function main() {
  console.log('=== Setup Database: prenotazioni_db ===\n');

  // 1. Check prerequisites
  if (!tryRun('node --version')) { fail('Node.js non trovato'); process.exit(1); }
  if (!tryRun('npx --version'))  { fail('npx/npm non trovato');  process.exit(1); }
  ok('Node.js e npm trovati');

  // 2. Check .env
  const envPath = path.join(SCRIPT_DIR, '.env');
  if (!existsSync(envPath)) {
    fail('File .env non trovato nella directory del backend.');
    console.log('   Assicurati che pg_backend/.env esista con DATABASE_URL configurata.');
    process.exit(1);
  }
  ok('File .env trovato');

  // 3. Parse DATABASE_URL
  let dbUrl, config;
  try {
    dbUrl = loadEnv(envPath);
    config = parseDbUrl(dbUrl);
  } catch (e) {
    fail(e.message);
    process.exit(1);
  }
  ok(`Database: "${config.dbName}" su ${config.host}:${config.port}`);

  // 4. Check PostgreSQL service (platform-specific)
  console.log('\n🔍 Verifica PostgreSQL...');
  const serviceOk = checkPgService();

  // 5. Try connecting with detailed error diagnostics
  console.log('   Tentativo connessione a PostgreSQL...');
  let client = null;
  let lastError = null;

  for (const db of MAINTENANCE_DBS) {
    try {
      client = new Client({
        user: config.user,
        password: config.password,
        host: config.host,
        port: config.port,
        database: db,
      });
      await client.connect();
      ok(`Connesso al database di manutenzione "${db}"`);
      break;
    } catch (e) {
      lastError = e;
    }
  }

  if (!client) {
    // Ultimate fallback: try connecting directly to target database
    try {
      client = new Client({
        user: config.user,
        password: config.password,
        host: config.host,
        port: config.port,
        database: config.dbName,
      });
      await client.connect();
      info(`Connesso direttamente al database "${config.dbName}"`);
    } catch (e) {
      lastError = e;
    }
  }

  if (!client) {
    fail(`PostgreSQL non raggiungibile su ${config.host}:${config.port}`);
    console.log('');
    console.log(`   \x1b[33m⚠ Errore:\x1b[0m ${lastError.message}`);

    const pgCode = lastError.code;
    const known = PG_ERROR_CODES[pgCode];
    if (known) {
      console.log(`   \x1b[33m→\x1b[0m ${known}`);
    }

    console.log('');
    console.log('   \x1b[1mPossibili soluzioni:\x1b[0m');

    if (pgCode === 'ECONNREFUSED' || lastError.message.includes('connect ECONNREFUSED')) {
      if (process.platform === 'win32') {
        hint('Verifica che il servizio PostgreSQL sia in esecuzione in Services.msc');
        hint('Controlla che postgresql.conf abbia: listen_addresses = \'*\' o \'localhost\'');
        code('netstat -ano | findstr :5432');
        hint('Se il comando non mostra nulla, PostgreSQL non è in ascolto sulla porta 5432.');
        hint('Percorso tipico postgresql.conf su Windows:');
        hint('C:\\Program Files\\PostgreSQL\\18\\data\\postgresql.conf');
      } else {
        hint('Verifica che PostgreSQL sia in esecuzione.');
        code('sudo systemctl status postgresql   # Linux');
        code('brew services list                 # macOS');
        hint('Controlla listen_addresses in postgresql.conf');
      }
    }

    if (pgCode === '28P01' || lastError.message.includes('password authentication')) {
      hint('La password in .env non corrisponde a quella dell\'utente PostgreSQL.');
      hint('Verifica o reimposta la password:');
      code('psql -U postgres -c "ALTER USER postgres PASSWORD \'nuova_password\';"');
      if (process.platform === 'win32') {
        hint('Oppure modifica pg_hba.conf per usare trust in sviluppo:');
        hint('C:\\Program Files\\PostgreSQL\\18\\data\\pg_hba.conf');
        hint('Aggiungi/modifica: host all all 127.0.0.1/32 trust');
      } else {
        hint('Oppure modifica pg_hba.conf: host all all 127.0.0.1/32 trust');
        code('sudo nano $(psql -U postgres -c "SHOW hba_file" 2>/dev/null | tail -3 | head -1)');
      }
    }

    if (pgCode === 'ENOTFOUND') {
      hint(`L'host "${config.host}" non è raggiungibile.`);
      hint('Usa 127.0.0.1 invece di localhost se sei su Windows (problema IPv6).');
    }

    if (serviceOk === false) {
      if (process.platform === 'win32') {
        hint('Nessun servizio PostgreSQL installato. Scaricalo da:');
        hint('https://www.postgresql.org/download/windows/');
      }
    }

    console.log('');
    process.exit(1);
  }

  // 6. Create database if not exists
  const res = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1', [config.dbName]
  );
  if (res.rows.length > 0) {
    info(`Database "${config.dbName}" già esistente`);
  } else {
    console.log('   Creazione database...');
    await client.query(`CREATE DATABASE "${config.dbName.replace(/"/g, '""')}"`);
    ok(`Database "${config.dbName}" creato`);
  }
  await client.end();

  // 7. Check migrations folder
  const migrationsDir = path.join(SCRIPT_DIR, 'prisma', 'migrations');
  if (!existsSync(migrationsDir)) {
    fail('Cartella prisma/migrations/ non trovata.');
    console.log('   Esegui: npx prisma migrate dev --name init');
    process.exit(1);
  }

  // 8. Apply Prisma migrations
  console.log('\n🔄 Applicazione migrazioni Prisma...');
  run('npx prisma migrate deploy');
  ok('Migrazioni applicate');

  // 9. Generate Prisma Client
  console.log('🔄 Generazione Prisma Client...');
  run('npx prisma generate');
  ok('Prisma Client generato');

  console.log('\n=== \x1b[32m✅ Setup completato!\x1b[0m ===');
  console.log('   Per avviare il server:  npm run dev');
  console.log('   Per popolare con dati:  npm run seed');
}

main().catch(e => {
  console.error(`\n\x1b[31m❌ Errore: ${e.message}\x1b[0m`);
  process.exit(1);
});
