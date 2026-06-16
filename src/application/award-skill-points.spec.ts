import { describe, test, expect, beforeEach } from 'vitest';
import { AwardSkillPoints } from './award-skill-points';
import { InMemorySkillRepository, SpyMessenger, StubPlayerQuery } from '../testing/fakes';
import { emptyState } from '../domain/skills/skill-state';

describe('AwardSkillPoints (V2 : 5 niveaux = 1 pt)', () => {
  let repo: InMemorySkillRepository;
  let messenger: SpyMessenger;
  let players: StubPlayerQuery;

  beforeEach(() => {
    repo = new InMemorySkillRepository();
    messenger = new SpyMessenger();
    players = new StubPlayerQuery();
  });

  test('accorde 2 points en atteignant le niveau 10', () => {
    repo.save('p1', { ...emptyState(), maxVanillaLevel: 0 });
    players.players = [{ id: 'p1', name: 'Alice', level: 10 }];

    new AwardSkillPoints(players, repo, messenger).run();

    expect(repo.load('p1').unspentPoints).toBe(2);
    expect(repo.load('p1').maxVanillaLevel).toBe(10);
    expect(messenger.actionBars[0]?.msg).toContain('+2');
  });

  test('rien si le niveau n’a pas dépassé le max', () => {
    repo.save('p1', { ...emptyState(), maxVanillaLevel: 10 });
    players.players = [{ id: 'p1', name: 'Alice', level: 3 }];

    new AwardSkillPoints(players, repo, messenger).run();

    expect(repo.load('p1').unspentPoints).toBe(0);
    expect(messenger.actionBars).toHaveLength(0);
  });

  test('anti-farm : remonter sous un max déjà atteint ne redonne rien', () => {
    repo.save('p1', { ...emptyState(), maxVanillaLevel: 40 });
    players.players = [{ id: 'p1', name: 'Alice', level: 39 }];

    new AwardSkillPoints(players, repo, messenger).run();

    expect(repo.load('p1').unspentPoints).toBe(0);
  });

  test('met à jour le max sans notifier quand aucun palier de 5 n’est franchi', () => {
    repo.save('p1', { ...emptyState(), maxVanillaLevel: 5 });
    players.players = [{ id: 'p1', name: 'Alice', level: 6 }];

    new AwardSkillPoints(players, repo, messenger).run();

    expect(repo.load('p1').maxVanillaLevel).toBe(6);
    expect(repo.load('p1').unspentPoints).toBe(0);
    expect(messenger.actionBars).toHaveLength(0);
  });
});
