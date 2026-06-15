import { describe, test, expect } from 'vitest';
import { EnsureGrimoire, GRIMOIRE_ID } from './ensure-grimoire';
import { InMemorySkillRepository, FakeItemService } from '../testing/fakes';

describe('EnsureGrimoire', () => {
  test('ne donne rien à un joueur qui n’a jamais possédé le grimoire', () => {
    const repo = new InMemorySkillRepository();
    const items = new FakeItemService();
    new EnsureGrimoire(items, repo).onRespawn('p1');
    expect(items.hasItem('p1', GRIMOIRE_ID)).toBe(false);
  });

  test('redonne le grimoire au respawn si possédé puis perdu', () => {
    const repo = new InMemorySkillRepository();
    const items = new FakeItemService();
    const uc = new EnsureGrimoire(items, repo);
    uc.onUse('p1'); // possession enregistrée
    uc.onRespawn('p1'); // perdu à la mort → rendu
    expect(items.hasItem('p1', GRIMOIRE_ID)).toBe(true);
  });

  test('ne duplique pas si le joueur le possède déjà', () => {
    const repo = new InMemorySkillRepository();
    const items = new FakeItemService();
    const uc = new EnsureGrimoire(items, repo);
    uc.onUse('p1');
    items.giveItem('p1', GRIMOIRE_ID, 1);
    uc.onRespawn('p1');
    expect(items.inventories.get('p1')?.get(GRIMOIRE_ID)).toBe(1);
  });
});
