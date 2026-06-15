import { describe, test, expect } from 'vitest';
import { InitPlayer } from './init-player';
import { InMemorySkillRepository } from '../testing/fakes';

describe('InitPlayer', () => {
  test('cale le max sur le niveau courant au premier enregistrement', () => {
    const repo = new InMemorySkillRepository();
    new InitPlayer(repo).run('p1', 30);
    expect(repo.load('p1').maxVanillaLevel).toBe(30);
    expect(repo.load('p1').unspentPoints).toBe(0);
  });

  test('idempotent : ne réécrit pas un joueur déjà initialisé', () => {
    const repo = new InMemorySkillRepository();
    new InitPlayer(repo).run('p1', 30);
    repo.save('p1', { ...repo.load('p1'), unspentPoints: 5 });
    new InitPlayer(repo).run('p1', 99);
    expect(repo.load('p1').unspentPoints).toBe(5);
    expect(repo.load('p1').maxVanillaLevel).toBe(30);
  });
});
