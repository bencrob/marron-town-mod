import { describe, test, expect } from 'vitest';
import { InitPlayer } from './init-player';
import { InMemorySkillRepository } from '../testing/fakes';

describe('InitPlayer', () => {
  test('offre 10 points de départ et cale le max sur le niveau courant', () => {
    const repo = new InMemorySkillRepository();
    new InitPlayer(repo).run('p1', 30);
    const s = repo.load('p1');
    expect(s.unspentPoints).toBe(10);
    expect(s.totalPointsEarned).toBe(10);
    expect(s.maxVanillaLevel).toBe(30);
  });

  test('idempotent : ne réécrit pas un joueur déjà initialisé', () => {
    const repo = new InMemorySkillRepository();
    new InitPlayer(repo).run('p1', 30);
    repo.save('p1', { ...repo.load('p1'), unspentPoints: 3 });
    new InitPlayer(repo).run('p1', 99);
    expect(repo.load('p1').unspentPoints).toBe(3);
    expect(repo.load('p1').maxVanillaLevel).toBe(30);
  });
});
