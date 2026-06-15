import { describe, test, expect } from 'vitest';
import { HandleDeath } from './handle-death';
import { InMemorySkillRepository, SpyMessenger } from '../testing/fakes';
import { emptyState } from '../domain/skills/skill-state';

describe('HandleDeath', () => {
  test('perd les points non-dépensés et notifie', () => {
    const repo = new InMemorySkillRepository();
    const messenger = new SpyMessenger();
    repo.save('p1', {
      ...emptyState(),
      unspentPoints: 5,
      totalPointsEarned: 12,
      levels: { agility: 7, attack: 0, defense: 0, mining: 0 },
    });

    new HandleDeath(repo, messenger).onRespawn('p1');

    const after = repo.load('p1');
    expect(after.unspentPoints).toBe(0);
    expect(after.levels.agility).toBe(7); // niveaux conservés
    expect(after.totalPointsEarned).toBe(12);
    expect(messenger.chats[0]?.msg).toContain('5');
  });

  test('aucun message si aucun point à perdre', () => {
    const repo = new InMemorySkillRepository();
    const messenger = new SpyMessenger();
    repo.save('p1', { ...emptyState(), unspentPoints: 0 });

    new HandleDeath(repo, messenger).onRespawn('p1');

    expect(messenger.chats).toHaveLength(0);
  });
});
