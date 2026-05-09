#!/usr/bin/env bash
set -euo pipefail

DB_NAME="prenotazioni_db"
DB_USER="postgres"
DB_PASS="YOLO"

echo "=== Setup Database: $DB_NAME ==="

# 1. Controlla che PostgreSQL sia in esecuzione
if ! pg_isready -q 2>/dev/null; then
  echo "❌ PostgreSQL non è in esecuzione."
  echo "   Avvialo con:  sudo systemctl start postgresql"
  echo "   Oppure:       sudo pg_ctlcluster <versione> main start"
  exit 1
fi
echo "✅ PostgreSQL è in esecuzione."

# 2. Crea il database se non esiste
if psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo "ℹ️  Database '$DB_NAME' già esistente."
else
  echo "📦 Creazione database '$DB_NAME'..."
  createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null || {
    echo "   (tentativo con sudo...)";
    sudo -u postgres createdb "$DB_NAME";
  }
  echo "✅ Database creato."
fi

# 3. Applica le migrazioni Prisma
echo "🔄 Applicazione migrazioni Prisma..."
npx prisma migrate deploy
echo "✅ Migrazioni applicate."

# 4. Genera il client Prisma
echo "🔄 Generazione Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generato."

echo ""
echo "=== Setup completato! ==="
echo "   Per avviare il server: npm run dev"
echo "   Per seed dati:         npm run seed"
