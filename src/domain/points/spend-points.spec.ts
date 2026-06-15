import { describe, test, expect } from 'vitest';
import { emptyState } from '../skills/skill-state';
import { canLevelUp, levelUpSkill } from './spend-points';

function stateWith(unspent: number, agility = 0) {
  return { ...emptyState(), unspentPoints: unspent, levels: { agility, attack: 0, defense: 0, mining: 0 } };
}

describe('spend-points', () => {
  test('monte un niveau si points suffisants', () => {
    const r = levelUpSkill(stateWith(3), 'agility', 1);
    expect(r.ok).toBe(true);
    expect(r.state.levels.agility).toBe(1);
    expect(r.state.unspentPoints).toBe(2);
  });

  test('refuse sans assez de points', () => {
    const r = levelUpSkill(stateWith(0), 'agility', 1);
    expect(r.ok).toBe(false);
    expect(r.state.levels.agility).toBe(0);
  });

  test('refuse de dépasser le niveau max', () => {
    const r = levelUpSkill(stateWith(10, 99), 'agility', 5);
    expect(r.ok).toBe(false);
  });

  test('achat de +5 niveaux d’un coup', () => {
    const r = levelUpSkill(stateWith(5), 'attack', 5);
    expect(r.ok).toBe(true);
    expect(r.state.levels.attack).toBe(5);
    expect(r.state.unspentPoints).toBe(0);
  });

  test('canLevelUp refuse une quantité nulle ou négative', () => {
    expect(canLevelUp(stateWith(5), 'mining', 0)).toBe(false);
    expect(canLevelUp(stateWith(5), 'mining', -1)).toBe(false);
  });
});
