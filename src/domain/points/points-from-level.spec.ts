import { describe, test, expect } from 'vitest';
import { pointsForCrossing, XP_POINT_CAP } from './points-from-level';

describe('pointsForCrossing (V2 : 5 niveaux = 1 pt, plafond 90)', () => {
  test('niveau 5 atteint depuis 0 → 1 point', () => {
    expect(pointsForCrossing(0, 5)).toEqual({ pointsAwarded: 1, newMax: 5 });
  });

  test('niveau 4 → 0 point (pas encore 5)', () => {
    expect(pointsForCrossing(0, 4)).toEqual({ pointsAwarded: 0, newMax: 4 });
  });

  test('niveau 20 → 4 points cumulés', () => {
    expect(pointsForCrossing(0, 20).pointsAwarded).toBe(4);
  });

  test('redescente (suicide-farm) → 0 point, max conservé', () => {
    expect(pointsForCrossing(40, 2)).toEqual({ pointsAwarded: 0, newMax: 40 });
  });

  test('plafond : impossible de dépasser 90 points via l’XP', () => {
    expect(pointsForCrossing(0, 100000).pointsAwarded).toBe(XP_POINT_CAP);
  });

  test('au-delà du plafond, plus aucun point', () => {
    // 450 = 90 pts ; monter encore ne donne rien
    expect(pointsForCrossing(450, 600)).toEqual({ pointsAwarded: 0, newMax: 600 });
  });

  test('dernier point pile au plafond (445 → 450)', () => {
    expect(pointsForCrossing(445, 450)).toEqual({ pointsAwarded: 1, newMax: 450 });
  });
});
