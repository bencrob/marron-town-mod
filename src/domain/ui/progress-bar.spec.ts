import { describe, test, expect } from 'vitest';
import { renderBar, percent, formatHHMM, tierMark } from './progress-bar';

describe('progress-bar', () => {
  test('barre vide à 0', () => {
    expect(renderBar(0, 100, 20)).toBe(`§a§7${'▯'.repeat(20)}§r`);
  });

  test('barre pleine à 100', () => {
    expect(renderBar(100, 100, 20)).toBe(`§a${'▮'.repeat(20)}§7§r`);
  });

  test('barre à moitié', () => {
    expect(renderBar(50, 100, 20)).toBe(`§a${'▮'.repeat(10)}§7${'▯'.repeat(10)}§r`);
  });

  test('percent', () => {
    expect(percent(25, 100)).toBe(25);
    expect(percent(0, 0)).toBe(0);
  });

  test('formatHHMM', () => {
    expect(formatHHMM(0)).toBe('00:00');
    expect(formatHHMM((11 * 60 + 5) * 60000)).toBe('11:05');
  });

  test('tierMark', () => {
    expect(tierMark(true)).toContain('✔️');
    expect(tierMark(false)).toContain('✖️');
  });
});
