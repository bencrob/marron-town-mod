import { describe, test, expect } from 'vitest';
import { ResetSkills } from './reset-skills';
import { InMemorySkillRepository } from '../testing/fakes';
import { emptyState } from '../domain/skills/skill-state';

describe('ResetSkills', () => {
  test('remet les niveaux à 0 et rend tous les points', () => {
    const repo = new InMemorySkillRepository();
    repo.save('p1', {
      ...emptyState(),
      unspentPoints: 5,
      totalPointsEarned: 50,
      levels: { agility: 30, attack: 10, defense: 5, mining: 0 },
    });
    repo.setChoiceMade('p1', 'agility', 1);

    const freed = new ResetSkills(repo).run('p1');

    const s = repo.load('p1');
    expect(s.levels).toEqual({ agility: 0, attack: 0, defense: 0, mining: 0 });
    expect(s.unspentPoints).toBe(50); // tout redevient disponible
    expect(freed).toBe(45); // 50 gagnés − 5 déjà dispo = 45 rendus
    expect(repo.isChoiceMade('p1', 'agility')).toBe(false); // choix déverrouillé
  });
});
