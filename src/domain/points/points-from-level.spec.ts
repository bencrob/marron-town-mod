import { describe, test, expect } from 'vitest';
import { pointsForCrossing } from './points-from-level';

describe('pointsForCrossing', () => {
  test('niveau 4 atteint depuis 0 → 1 point', () => {
    expect(pointsForCrossing(0, 4)).toEqual({ pointsAwarded: 1, newMax: 4 });
  });

  test('rester au même niveau max → 0 point', () => {
    expect(pointsForCrossing(4, 4)).toEqual({ pointsAwarded: 0, newMax: 4 });
  });

  test('bond de 3 à 11 franchit les paliers 4 et 8 → 2 points', () => {
    expect(pointsForCrossing(3, 11)).toEqual({ pointsAwarded: 2, newMax: 11 });
  });

  test('niveau 20 → 5e palier cumulé', () => {
    expect(pointsForCrossing(0, 20).pointsAwarded).toBe(5);
  });

  test('redescente (suicide-farm) → 0 point et max conservé', () => {
    expect(pointsForCrossing(40, 2)).toEqual({ pointsAwarded: 0, newMax: 40 });
  });

  test('remonter sous le max déjà atteint ne redonne rien', () => {
    expect(pointsForCrossing(40, 39)).toEqual({ pointsAwarded: 0, newMax: 40 });
  });

  test('dépasser le max d’un palier après redescente → 1 seul point', () => {
    // max déjà 40 (10 pts), on remonte jusqu'à 44 → +1 seul
    expect(pointsForCrossing(40, 44)).toEqual({ pointsAwarded: 1, newMax: 44 });
  });
});
