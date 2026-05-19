import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('[EMAIL] SMTP not configured — emails will be logged to console');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
  });

  transporter.verify().then(() => {
    console.log('[EMAIL] Connessione SMTP verificata con successo');
  }).catch((err) => {
    console.error('[EMAIL] ERRORE connessione SMTP — credenziali o server non validi:', err.message);
  });

  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const t = getTransporter();

  if (!t) {
    console.log(`[EMAIL] To: ${to}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${html}`);
    return;
  }

  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@unimeet.it',
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Inviata a ${to} — oggetto: ${subject}`);
  } catch (err) {
    console.error(`[EMAIL] ERRORE invio a ${to}:`, err instanceof Error ? err.message : err);
  }
}

export async function sendCodiceVerifica(email: string, codice: string, tipo: string): Promise<void> {
  const subject = tipo === 'reset_password'
    ? 'UniMeet — Codice di recupero password'
    : 'UniMeet — Codice di verifica';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2563eb; font-size: 28px; margin: 0;">UniMeet</h1>
        <p style="color: #64748b; font-size: 15px; margin: 4px 0 0;">Sistema prenotazione ricevimento</p>
      </div>
      <h2 style="color: #0f172a; font-size: 20px; text-align: center; margin: 0 0 8px;">
        ${subject}
      </h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 24px;">
        Utilizza il codice seguente per completare la procedura.<br>
        Il codice scade tra <strong>15 minuti</strong>.
      </p>
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; background: #eef2ff; padding: 16px 32px; border-radius: 12px; font-family: monospace;">
          ${codice}
        </span>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
        Se non hai richiesto tu questo codice ignora questa email.
      </p>
    </div>
  `;

  await sendEmail(email, subject, html);
}
