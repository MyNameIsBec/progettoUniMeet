#!/usr/bin/env node
const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const path = require('path');
const { Client } = require('pg');

const SCRIPT_DIR = path.dirname(process.argv[1]);
const DB_MAINTENANCE = 'postgres';

function ok(msg)  { console.log(`\x1b[32m✅\x1b[0m ${msg}`); }
function info(msg){ console.log(`\x1b[33mℹ️ \x1b[0m${msg}`); }
function fail(msg){ console.log(`\x1b[31m❌\x1b[0m ${msg}`); }

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

function platformHint() {
  switch (process.platform) {
    case 'win32':
      return '   Avvia il servizio PostgreSQL da Services.msc';
    case 'darwin':
      return '   brew services start postgresql@16';
    default:
      return '   sudo systemctl start postgresql';
  }
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

  // 4. Check PostgreSQL
  let client;
  try {
    client = new Client({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      database: DB_MAINTENANCE,
    });
    await client.connect();
    ok('PostgreSQL raggiungibile');
  } catch {
    fail('PostgreSQL non raggiungibile');
    console.log(platformHint());
    process.exit(1);
  }

  // 5. Create database if not exists
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

  // 6. Check migrations folder
  const migrationsDir = path.join(SCRIPT_DIR, 'prisma', 'migrations');
  if (!existsSync(migrationsDir)) {
    fail('Cartella prisma/migrations/ non trovata.');
    console.log('   Esegui: npx prisma migrate dev --name init');
    process.exit(1);
  }

  // 7. Apply Prisma migrations
  console.log('\n🔄 Applicazione migrazioni Prisma...');
  run('npx prisma migrate deploy');
  ok('Migrazioni applicate');

  // 8. Generate Prisma Client
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
