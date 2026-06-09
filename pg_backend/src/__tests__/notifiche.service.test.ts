import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from './setup';
import * as notifiche from '../services/notifiche.service';

const mockNotifica = {
  id_notifica: 'notif-1',
  titolo: 'Test',
  messaggio: 'Test message',
  data_invio: new Date('2024-01-15T10:00:00Z'),
  tipo: 'info',
  letta: false,
  destinatario_id: 'user-1',
  destinatario_ruolo: 'STUDENTE',
};

beforeEach(() => vi.clearAllMocks());

describe('getNotifiche', () => {
  it('returns notifications for a user', async () => {
    prismaMock.notifica.findMany.mockResolvedValue([mockNotifica]);

    const result = await notifiche.getNotifiche('user-1');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'notif-1',
      titolo: 'Test',
      letta: false,
    });
  });

  it('filters by ruolo', async () => {
    prismaMock.notifica.findMany.mockResolvedValue([]);

    await notifiche.getNotifiche('user-1', 'STUDENTE');
    expect(prismaMock.notifica.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { destinatario_id: 'user-1', destinatario_ruolo: 'STUDENTE' },
      })
    );
  });
});

describe('createNotifica', () => {
  it('creates a notification', async () => {
    prismaMock.notifica.create.mockResolvedValue(mockNotifica);

    const result = await notifiche.createNotifica({
      titolo: 'Test',
      messaggio: 'Test message',
      tipo: 'info',
      destinatarioId: 'user-1',
      destinatarioRuolo: 'STUDENTE',
    });

    expect(result).toMatchObject({
      id: 'notif-1',
      titolo: 'Test',
    });
  });
});

describe('segnaComeLetta', () => {
  it('marks notification as read', async () => {
    prismaMock.notifica.findUnique.mockResolvedValue(mockNotifica);
    prismaMock.notifica.update.mockResolvedValue({ ...mockNotifica, letta: true });

    await expect(notifiche.segnaComeLetta('notif-1')).resolves.not.toThrow();
    expect(prismaMock.notifica.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { letta: true },
      })
    );
  });

  it('throws on non-existent notification', async () => {
    prismaMock.notifica.findUnique.mockResolvedValue(null);
    await expect(notifiche.segnaComeLetta('invalid')).rejects.toThrow('Notifica not found');
  });
});

describe('segnaTutteComeLette', () => {
  it('marks all notifications as read', async () => {
    prismaMock.notifica.updateMany.mockResolvedValue({ count: 3 });

    await expect(notifiche.segnaTutteComeLette('user-1')).resolves.not.toThrow();
    expect(prismaMock.notifica.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { destinatario_id: 'user-1', letta: false },
        data: { letta: true },
      })
    );
  });
});

describe('cancellaNotificheLette', () => {
  it('deletes read notifications', async () => {
    prismaMock.notifica.deleteMany.mockResolvedValue({ count: 2 });

    await expect(notifiche.cancellaNotificheLette('user-1')).resolves.not.toThrow();
    expect(prismaMock.notifica.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { destinatario_id: 'user-1', letta: true },
      })
    );
  });
});
