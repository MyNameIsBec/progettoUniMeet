import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as reminder from '../services/reminder.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('avviaReminderJob', () => {
  it('schedules a cron job', () => {
    reminder.avviaReminderJob();
  });
});
