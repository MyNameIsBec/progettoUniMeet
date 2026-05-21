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

async function waitForPostgres(url, timeout = 30000) {
  const pg = require('pg');
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
      // fallback: prova pg_ctlcluster
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
      // Prova ad avviare il servizio trovato
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
  if (containers.includes('pg_prenotazioni')) {
    log('DB', 'Avvio container Docker pg_prenotazioni...');
    execSync('docker start pg_prenotazioni', { stdio: 'pipe', timeout: 15000 });
    return true;
  }

  log('DB', 'Nessun container pg_prenotazioni trovato.');
  return false;
}

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('         UniMeet — Avvio progetto          ');
  console.log('═══════════════════════════════════════════');
  console.log('');

  const env = loadEnv();
  let dbUrl = env.DATABASE_URL || 'postgresql://postgres:YOLO@localhost:5432/prenotazioni_db';

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

  // ── 2. Backend ──
  log('BACKEND', 'Avvio backend...');
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: BACKEND,
    stdio: 'pipe',
    shell: true,
  });
  backend.stdout.on('data', d => process.stdout.write(`[BACKEND] ${d}`));
  backend.stderr.on('data', d => process.stderr.write(`[BACKEND] ${d}`));

  await new Promise(r => setTimeout(r, 3000));

  // ── 3. Frontend ──
  log('FRONTEND', 'Avvio frontend...');
  const frontend = spawn('npm', ['start'], {
    cwd: FRONTEND,
    stdio: 'pipe',
    shell: true,
  });
  frontend.stdout.on('data', d => process.stdout.write(`[FRONTEND] ${d}`));
  frontend.stderr.on('data', d => process.stderr.write(`[FRONTEND] ${d}`));

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  Backend  → http://localhost:5000');
  console.log('  Frontend → http://localhost:4200');
  console.log('  Premi Ctrl+C per arrestare tutto.');
  console.log('═══════════════════════════════════════════');
  console.log('');

  // ── 4. Graceful shutdown ──
  const shutdown = () => {
    console.log('\n');
    log('STOP', 'Arresto in corso...');
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
    setTimeout(() => {
      backend.kill('SIGKILL');
      frontend.kill('SIGKILL');
      process.exit(0);
    }, 5000);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Se un processo muore, ferma tutto
  backend.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log('ERR', `Backend terminato con codice ${code}`);
      frontend.kill();
      process.exit(code);
    }
  });
  frontend.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log('ERR', `Frontend terminato con codice ${code}`);
      backend.kill();
      process.exit(code);
    }
  });
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
