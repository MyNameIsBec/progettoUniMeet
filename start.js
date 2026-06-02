#!/usr/bin/env node
const { spawn, execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const ROOT = __dirname;
const BACKEND = path.join(ROOT, 'pg_backend');
const FRONTEND = path.join(ROOT, 'pg_frontend');
const ENV_PATH = path.join(BACKEND, '.env');
const IS_WIN = os.platform() === 'win32';

// ── Flags ──
const flags = { reset: false, noSeed: false, noStart: false };
for (const arg of process.argv.slice(2)) {
  if (arg === '--reset')    flags.reset = true;
  if (arg === '--no-seed')   flags.noSeed = true;
  if (arg === '--no-start')  flags.noStart = true;
}

// ── Utilities ──

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const env = {};
  for (const line of fs.readFileSync(ENV_PATH, 'utf-8').split('\n')) {
    const m = line.match(/^\s*(\w+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

function log(tag, msg) {
  const ts = new Date().toLocaleTimeString('it-IT');
  console.log(`[${ts}][${tag}] ${msg}`);
}

function openBrowser(url) {
  const platform = os.platform();
  const detached = spawn(
    platform === 'darwin' ? 'open' :
    platform === 'win32' ? 'cmd' :
    'xdg-open',
    platform === 'win32' ? ['/c', 'start', url] : [url],
    { stdio: 'ignore', detached: true }
  );
  detached.unref();
}

async function waitForPostgres(url, timeout = 30000) {
  let pg;
  try {
    pg = require('pg');
  } catch {
    pg = require(path.join(BACKEND, 'node_modules/pg'));
  }
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const pool = new pg.Pool({ connectionString: url, connectionTimeoutMillis: 3000 });
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      await pool.end();
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  return false;
}

async function startPostgreSQL() {
  const platform = os.platform();

  if (platform === 'linux') {
    try {
      log('DB', 'Avvio PostgreSQL via systemd...');
      execSync('sudo systemctl start postgresql', { stdio: 'pipe', timeout: 15000 });
      return true;
    } catch {
      try {
        const ver = execSync('pg_lsclusters -h 2>/dev/null || echo "15"', { encoding: 'utf-8' })
          .trim().split('\n')[0]?.match(/\d+/)?.[0] || '15';
        execSync(`sudo pg_ctlcluster ${ver} main start`, { stdio: 'pipe', timeout: 15000 });
        return true;
      } catch {
        log('DB', 'systemd non disponibile, assumi PostgreSQL già avviato');
        return null;
      }
    }
  }

  if (platform === 'darwin') {
    try {
      log('DB', 'Avvio PostgreSQL via Homebrew...');
      execSync('brew services start postgresql@16', { stdio: 'pipe', timeout: 15000 });
      return true;
    } catch {
      try {
        execSync('brew services start postgresql', { stdio: 'pipe', timeout: 15000 });
        return true;
      } catch {
        log('DB', 'Homebrew non disponibile, assumi PostgreSQL già avviato');
        return null;
      }
    }
  }

  if (platform === 'win32') {
    try {
      log('DB', 'Avvio PostgreSQL su Windows...');
      const out = execSync('sc query postgresql* 2>nul || net start postgresql* 2>nul', {
        stdio: 'pipe', timeout: 15000, encoding: 'utf-8',
      });
      const match = out.match(/postgresql[^\s]*/i);
      if (match) {
        execSync(`net start ${match[0]}`, { stdio: 'pipe', timeout: 15000 });
      }
      return true;
    } catch {
      log('DB', 'Servizio PostgreSQL non trovato, assumi già avviato');
      return null;
    }
  }

  return null;
}

async function startDocker() {
  try {
    execSync('docker info', { stdio: 'pipe', timeout: 5000 });
  } catch {
    return false;
  }

  const containers = execSync('docker ps -a --format "{{.Names}}"', { encoding: 'utf-8', timeout: 5000 });
  for (const name of ['pg_prenotazioni', 'unimeet-db']) {
    if (containers.includes(name)) {
      log('DB', `Avvio container Docker ${name}...`);
      execSync(`docker start ${name}`, { stdio: 'pipe', timeout: 15000 });
      return true;
    }
  }

  log('DB', 'Nessun container PostgreSQL Docker trovato.');
  return false;
}

// ── Nuove funzioni: install / setup / seed ──

function installDeps(dir, label) {
  const nm = path.join(dir, 'node_modules');
  if (fs.existsSync(nm)) {
    try {
      execSync('npm ls --depth=0', { cwd: dir, stdio: 'pipe' });
      log('INSTALL', `${label}: dipendenze già presenti`);
      return;
    } catch {
      log('INSTALL', `${label}: dipendenze mancanti, reinstallo...`);
    }
  }
  log('INSTALL', `${label}: npm install in corso...`);
  execSync('npm install', { cwd: dir, stdio: 'inherit' });
  log('INSTALL', `${label}: completato ✅`);
}

async function connectPg(config) {
  const { Client } = require('pg');
  const client = new Client({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    database: 'postgres',
  });
  await client.connect();
  return client;
}

async function dbExists(client, dbName) {
  const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  return res.rows.length > 0;
}

async function hasSeedData(config) {
  const { Client } = require('pg');
  let client;
  try {
    client = new Client({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      database: config.dbName,
    });
    await client.connect();
    const res = await client.query('SELECT COUNT(*)::int AS cnt FROM "Studente"');
    return res.rows[0].cnt > 0;
  } catch {
    return false;
  } finally {
    if (client) await client.end();
  }
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

async function createDb(config) {
  const { Client } = require('pg');
  const client = new Client({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    database: 'postgres',
  });
  await client.connect();
  await client.query(`CREATE DATABASE "${config.dbName.replace(/"/g, '""')}"`);
  await client.end();
}

async function runSeed() {
  log('SEED', 'Popolo il database con dati di test...');
  execSync('npm run seed', { cwd: BACKEND, stdio: 'inherit' });
  log('SEED', 'Dati di test inseriti ✅');
}

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('         UniMeet — Avvio progetto          ');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  Usa --no-start per solo setup (senza avviare i servizi)');
  console.log('  Usa --reset   per ricreare il database da zero');
  console.log('  Usa --no-seed per saltare il seed iniziale');
  console.log('');

  // ── 0. Installa dipendenze se mancanti ──
  console.log('  Controllo dipendenze...');
  installDeps(ROOT, 'Root');
  installDeps(BACKEND, 'Backend');
  installDeps(FRONTEND, 'Frontend');
  console.log('');

  // ── 0.5 Genera client Prisma ──
  log('PRISMA', 'Generazione client Prisma...');
  execSync('npx prisma generate', { cwd: BACKEND, stdio: 'inherit' });
  log('PRISMA', 'Client Prisma generato ✅');
  console.log('');

  const env = loadEnv();
  const dbUrl = env.DATABASE_URL || 'postgresql://postgres:YOLO@localhost:5432/prenotazioni_db';
  const config = parseDbUrl(dbUrl);

  // ── 1. PostgreSQL ──
  log('DB', 'Verifico PostgreSQL...');
  const pgOk = await waitForPostgres(dbUrl, 5000);

  if (!pgOk) {
    log('DB', 'PostgreSQL non raggiungibile, tento l\'avvio...');

    const started = await startPostgreSQL();
    if (started) {
      log('DB', 'Attendo che PostgreSQL sia pronto...');
      const ready = await waitForPostgres(dbUrl, 30000);
      if (!ready) {
        log('ERR', 'PostgreSQL non risponde dopo l\'avvio.');
        process.exit(1);
      }
    } else {
      log('DB', 'PostgreSQL nativo non disponibile, provo con Docker...');
      const dockerOk = await startDocker();
      if (dockerOk) {
        log('DB', 'Attendo che PostgreSQL in Docker sia pronto...');
        const ready = await waitForPostgres(dbUrl, 30000);
        if (!ready) {
          log('ERR', 'PostgreSQL in Docker non risponde.');
          process.exit(1);
        }
      } else {
        log('ERR', 'Impossibile avviare PostgreSQL. Avvialo manualmente.');
        process.exit(1);
      }
    }
  }

  log('DB', 'PostgreSQL connesso. ✅');
  console.log('');

  // ── 1.5 Setup database / reset / seed ──
  const pgClient = await connectPg(config);

  if (flags.reset) {
    log('RESET', 'Reset del database...');
    await pgClient.query(`DROP DATABASE IF EXISTS "${config.dbName}" WITH (FORCE)`);
    await pgClient.query(`CREATE DATABASE "${config.dbName}"`);
    log('RESET', 'Database ricreato ✅');
    await pgClient.end();
    log('MIGRATE', 'Applicazione migrazioni Prisma...');
    execSync('npx prisma migrate deploy', { cwd: BACKEND, stdio: 'inherit' });
    log('MIGRATE', 'Migrazioni applicate ✅');
    if (!flags.noSeed) await runSeed();
  } else {
    const exists = await dbExists(pgClient, config.dbName);
    await pgClient.end();

    if (!exists) {
      log('SETUP', 'Database non trovato, creo...');
      await createDb(config);
      log('SETUP', 'Database creato ✅');
      log('MIGRATE', 'Applicazione migrazioni Prisma...');
      execSync('npx prisma migrate deploy', { cwd: BACKEND, stdio: 'inherit' });
      log('MIGRATE', 'Migrazioni applicate ✅');
    }

    if (!flags.noSeed) {
      const seeded = await hasSeedData(config);
      if (!seeded) {
        await runSeed();
      } else {
        log('SEED', 'Dati di test già presenti, skip');
      }
    }
  }

  if (flags.noStart) {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  Setup completato.                        ');
    console.log('  Per avviare i servizi:  node start.js    ');
    console.log('═══════════════════════════════════════════');
    console.log('');
    return;
  }

  // ── 2. Backend ──
  log('BACKEND', 'Avvio backend in modalità sviluppo (hot-reload)...');

  const backendEnv = { ...process.env, NODE_ENV: 'development' };
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: BACKEND,
    stdio: 'pipe',
    shell: true,
    env: backendEnv,
  });
  backend.stdout.on('data', d => process.stdout.write(`[BACKEND] ${d}`));
  backend.stderr.on('data', d => process.stderr.write(`[BACKEND] ${d}`));

  await new Promise(r => setTimeout(r, 3000));

  // ── 3. Prisma Studio ──
  const PRISMA_PORT = 5557;
  const prismaBin = path.join(
    BACKEND, 'node_modules', '.bin',
    IS_WIN ? 'prisma.cmd' : 'prisma'
  );
  log('PRISMA', `Avvio Prisma Studio su http://localhost:${PRISMA_PORT}...`);
  const prisma = spawn(prismaBin, ['studio', '--port', String(PRISMA_PORT), '--browser', 'none'], {
    cwd: BACKEND,
    stdio: 'pipe',
    shell: true,
  });
  prisma.stdout.on('data', d => process.stdout.write(`[PRISMA] ${d}`));
  prisma.stderr.on('data', d => process.stderr.write(`[PRISMA] ${d}`));
  setTimeout(() => openBrowser(`http://localhost:${PRISMA_PORT}`), 8000);

  // ── 4. Frontend ──
  log('FRONTEND', 'Avvio frontend...');
  let frontendUrlOpened = false;
  const frontend = spawn('npm', ['start'], {
    cwd: FRONTEND,
    stdio: 'pipe',
    shell: true,
  });
  frontend.stdout.on('data', d => {
    process.stdout.write(`[FRONTEND] ${d}`);
    const msg = d.toString();
    if ((msg.includes('localhost:4200') || msg.includes('compiled successfully')) && !frontendUrlOpened) {
      frontendUrlOpened = true;
      setTimeout(() => openBrowser('http://localhost:4200'), 1500);
    }
  });
  frontend.stderr.on('data', d => process.stderr.write(`[FRONTEND] ${d}`));

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  Backend       → http://localhost:5000');
  console.log('  Frontend      → http://localhost:4200');
  console.log('  Prisma Studio → http://localhost:5557');
  console.log('');
  console.log('  I browser si apriranno automaticamente');
  console.log('  non appena i servizi sono pronti.');
  console.log('  Premi Ctrl+C per arrestare tutto.');
  console.log('═══════════════════════════════════════════');
  console.log('');

  // ── 5. Graceful shutdown ──
  const shutdown = () => {
    console.log('\n');
    log('STOP', 'Arresto in corso...');
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
    prisma.kill('SIGTERM');
    setTimeout(() => {
      backend.kill('SIGKILL');
      frontend.kill('SIGKILL');
      prisma.kill('SIGKILL');
      process.exit(0);
    }, 5000);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  backend.on('exit', code => {
    if (code !== 0 && code !== null) {
      log('ERR', `Backend terminato con codice ${code}`);
      frontend.kill();
      prisma.kill();
      process.exit(code);
    }
  });
  frontend.on('exit', code => {
    if (code !== 0 && code !== null) {
      log('ERR', `Frontend terminato con codice ${code}`);
      backend.kill();
      prisma.kill();
      process.exit(code);
    }
  });
  prisma.on('exit', code => {
    if (code !== 0 && code !== null) {
      log('WARN', `Prisma Studio terminato con codice ${code}`);
    }
  });
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
