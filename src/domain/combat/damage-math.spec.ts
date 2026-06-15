import { describe, test, expect } from 'vitest';
import {
  bonusFromPct,
  critSurplus,
  healBackAmount,
  resistanceAmplifierForPct,
  isExecutable,
} from './damage-math';

describe('damage-math', () => {
  test('bonusFromPct', () => {
    expect(bonusFromPct(10, 0.2)).toBeCloseTo(2);
    expect(bonusFromPct(10, -1)).toBe(0);
  });

  test('critSurplus rend le surplus au-dessus du total', () => {
    expect(critSurplus(8, 1.5)).toBeCloseTo(4);
    expect(critSurplus(8, 2)).toBeCloseTo(8);
  });

  test('healBackAmount borné à [0,1]', () => {
    expect(healBackAmount(20, 0.25)).toBeCloseTo(5);
    expect(healBackAmount(20, 2)).toBe(20);
  });

  test('resistanceAmplifierForPct quantifie par 20 %', () => {
    expect(resistanceAmplifierForPct(0.2)).toBe(1);
    expect(resistanceAmplifierForPct(0.61)).toBe(3);
    expect(resistanceAmplifierForPct(2)).toBe(4);
  });

  test('isExecutable', () => {
    expect(isExecutable(2, 20, 0.15)).toBe(true);
    expect(isExecutable(5, 20, 0.15)).toBe(false);
    expect(isExecutable(2, 20, 0)).toBe(false);
  });
});
