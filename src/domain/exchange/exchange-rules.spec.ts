import { describe, test, expect } from 'vitest';
import { dayIndex, msUntilNextDay, pickDailyBonus, DAY_MS } from './exchange-rules';
import { DAILY_BONUS_POOL } from './exchange-catalog';

describe('exchange-rules', () => {
  test('dayIndex change à la frontière du jour', () => {
    expect(dayIndex(0)).toBe(0);
    expect(dayIndex(DAY_MS - 1)).toBe(0);
    expect(dayIndex(DAY_MS)).toBe(1);
  });

  test('msUntilNextDay', () => {
    expect(msUntilNextDay(0)).toBe(0);
    expect(msUntilNextDay(DAY_MS - 1000)).toBe(1000);
  });

  test('pickDailyBonus déterministe et dans le pool', () => {
    expect(pickDailyBonus(3)).toEqual(pickDailyBonus(3));
    expect(DAILY_BONUS_POOL).toContainEqual(pickDailyBonus(7));
  });

  test('l’offre bonus change selon le jour', () => {
    const a = pickDailyBonus(0).key;
    const b = pickDailyBonus(1).key;
    expect(a).not.toBe(b);
  });
});
