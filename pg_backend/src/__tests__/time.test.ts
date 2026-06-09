import { describe, it, expect } from 'vitest';
import { formatTime } from '../utils/time';

describe('formatTime', () => {
  it('formats UTC hours and minutes correctly', () => {
    const d = new Date('2024-01-15T09:30:00Z');
    expect(formatTime(d)).toBe('09:30');
  });

  it('pads single digit hours', () => {
    const d = new Date('2024-01-15T03:05:00Z');
    expect(formatTime(d)).toBe('03:05');
  });

  it('handles midnight', () => {
    const d = new Date('2024-01-15T00:00:00Z');
    expect(formatTime(d)).toBe('00:00');
  });

  it('handles noon', () => {
    const d = new Date('2024-01-15T12:00:00Z');
    expect(formatTime(d)).toBe('12:00');
  });
});
