import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as email from '../services/email.service';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('console', {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  });
});

describe('sendCodiceVerifica', () => {
  it('sends a verification email', async () => {
    const transporter = {
      verify: vi.fn().mockResolvedValue(true),
      sendMail: vi.fn().mockResolvedValue({ messageId: 'mock-id' }),
    };
    const nodemailer = await import('nodemailer');
    (nodemailer.default.createTransport as any).mockReturnValue(transporter);

    process.env.SMTP_USER = 'test@test.it';
    process.env.SMTP_PASS = 'password';

    await expect(email.sendCodiceVerifica('user@test.it', '123456', 'reset_password')).resolves.not.toThrow();
  });

  it('falls back to console log when SMTP not configured', async () => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    await expect(email.sendCodiceVerifica('user@test.it', '123456', 'reset_password')).resolves.not.toThrow();
  });
});
