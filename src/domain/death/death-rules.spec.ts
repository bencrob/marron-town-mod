import { describe, test, expect } from 'vitest';
import { emptyState } from '../skills/skill-state';
import { applyDeath } from './death-rules';

describe('applyDeath', () => {
  test('perd les points non-dépensés, garde niveaux et total', () => {
    const before = {
      ...emptyState(),
      unspentPoints: 7,
      totalPointsEarned: 20,
      levels: { agility: 13, attack: 0, defense: 0, mining: 0 },
    };
    const { state, pointsLost } = applyDeath(before);
    expect(pointsLost).toBe(7);
    expect(state.unspentPoints).toBe(0);
    expect(state.totalPointsEarned).toBe(20);
    expect(state.levels.agility).toBe(13);
  });

  test('aucune perte si aucun point disponible', () => {
    const { pointsLost } = applyDeath({ ...emptyState(), unspentPoints: 0 });
    expect(pointsLost).toBe(0);
  });
});
