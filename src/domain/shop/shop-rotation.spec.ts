import { describe, test, expect } from 'vitest';
import {
  ROTATION_PERIOD_MS,
  isRotationStale,
  msUntilNextRotation,
  seededPick,
} from './shop-rotation';

describe('rotation timing', () => {
  test('même fenêtre 12h → pas périmé', () => {
    expect(isRotationStale(1000, 2000)).toBe(false);
  });

  test('fenêtre suivante → périmé', () => {
    expect(isRotationStale(ROTATION_PERIOD_MS + 5, 5)).toBe(true);
  });

  test('msUntilNextRotation au début d’une fenêtre = période entière restante', () => {
    expect(msUntilNextRotation(0)).toBe(0); // pile sur la frontière
    expect(msUntilNextRotation(ROTATION_PERIOD_MS - 1000)).toBe(1000);
  });
});

describe('seededPick', () => {
  test('déterministe : même graine → même sélection et mêmes prix', () => {
    expect(seededPick(12345)).toEqual(seededPick(12345));
  });

  test('3 communs + 2 rares, slots 0–4', () => {
    const offers = seededPick(777);
    expect(offers).toHaveLength(5);
    expect(offers.filter((o) => o.item.rarity === 'common')).toHaveLength(3);
    expect(offers.filter((o) => o.item.rarity === 'rare')).toHaveLength(2);
    expect(offers.map((o) => o.slot)).toEqual([0, 1, 2, 3, 4]);
  });

  test('prix dans la fourchette de chaque item', () => {
    for (const o of seededPick(42)) {
      expect(o.price).toBeGreaterThanOrEqual(o.item.costMin);
      expect(o.price).toBeLessThanOrEqual(o.item.costMax);
    }
  });

  test('graines différentes → sélections (souvent) différentes', () => {
    const a = seededPick(1).map((o) => o.item.key).join();
    const b = seededPick(99999).map((o) => o.item.key).join();
    expect(a).not.toBe(b);
  });
});
