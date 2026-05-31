-- AlterTable
ALTER TABLE "Docente" ADD COLUMN     "lingua" TEXT NOT NULL DEFAULT 'it',
ADD COLUMN     "notifiche_app" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifiche_email" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reminder_ore" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "tema" TEXT NOT NULL DEFAULT 'system';

-- AlterTable
ALTER TABLE "Studente" ADD COLUMN     "lingua" TEXT NOT NULL DEFAULT 'it',
ADD COLUMN     "notifiche_app" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifiche_email" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reminder_ore" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "tema" TEXT NOT NULL DEFAULT 'system';
