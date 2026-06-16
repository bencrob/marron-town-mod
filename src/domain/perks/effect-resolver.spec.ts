import { describe, test, expect } from 'vitest';
import {
  resolvePassiveEffects,
  resolveCombatModifiers,
  resolveCapabilities,
} from './effect-resolver';

const lv = (p: Partial<Record<'agility' | 'attack' | 'defense' | 'mining', number>>) => ({
  agility: 0,
  attack: 0,
  defense: 0,
  mining: 0,
  ...p,
});
const ch = (p: Partial<Record<'agility' | 'attack' | 'defense' | 'mining', number>>) => ({
  agility: 0,
  attack: 0,
  defense: 0,
  mining: 0,
  ...p,
});
const amp = (fx: { effectId: string; amplifier: number }[], id: string) =>
  fx.find((e) => e.effectId === id)?.amplifier;

describe('resolvePassiveEffects (V2)', () => {
  test('aucun niveau → aucun effet', () => {
    expect(resolvePassiveEffects(lv({}))).toEqual([]);
  });

  test('mobilité : Speed I à 10, Speed II à 70', () => {
    expect(amp(resolvePassiveEffects(lv({ agility: 10 })), 'speed')).toBe(0);
    expect(amp(resolvePassiveEffects(lv({ agility: 70 })), 'speed')).toBe(1);
  });

  test('résistance : choix régén (0) vs absorption (1) au palier 20', () => {
    expect(amp(resolvePassiveEffects(lv({ defense: 20 }), ch({ defense: 0 })), 'regeneration')).toBe(0);
    expect(amp(resolvePassiveEffects(lv({ defense: 20 }), ch({ defense: 1 })), 'absorption')).toBe(0);
  });

  test('résistance 100 : cœurs + anti-feu + renfort du choix (amp 1)', () => {
    const fx = resolvePassiveEffects(lv({ defense: 100 }), ch({ defense: 0 }));
    expect(amp(fx, 'resistance')).toBe(1);
    expect(amp(fx, 'health_boost')).toBe(0);
    expect(amp(fx, 'fire_resistance')).toBe(0);
    expect(amp(fx, 'regeneration')).toBe(1);
  });

  test('minage : haste plafonné à I (amp 1) au 50', () => {
    expect(amp(resolvePassiveEffects(lv({ mining: 50 })), 'haste')).toBe(1);
  });
});

describe('resolveCombatModifiers (V2)', () => {
  test('attaque 20 → poison toutes les 10 frappes', () => {
    expect(resolveCombatModifiers(lv({ attack: 20 })).poisonEveryHits).toBe(10);
  });
  test('attaque 40 → crit léger 10 %', () => {
    expect(resolveCombatModifiers(lv({ attack: 40 })).critChance).toBe(0.1);
  });
  test('attaque < 60 → pas de débuff', () => {
    expect(resolveCombatModifiers(lv({ attack: 50 })).debuffEffect).toBeNull();
  });
  test('attaque 100 choix 1 → Lenteur, chance renforcée', () => {
    const m = resolveCombatModifiers(lv({ attack: 100 }), ch({ attack: 1 }));
    expect(m.debuffEffect).toBe('slowness');
    expect(m.debuffChance).toBe(0.25);
  });
});

describe('resolveCapabilities (V2)', () => {
  test('minage 100 choix Soie → vein étendu, soie, auto-fonte, détection, vision', () => {
    const c = resolveCapabilities(lv({ mining: 100 }), ch({ mining: 0 }));
    expect(c.veinMiner).toBe(true);
    expect(c.veinMinerMax).toBe(20);
    expect(c.silkTouchChance).toBe(0.4);
    expect(c.fortuneExtra).toBe(false);
    expect(c.autoSmelt).toBe(true);
    expect(c.oreDetection).toBe(true);
    expect(c.nightVisionMine).toBe(true);
  });
  test('minage 50 choix Fortune → fortuneExtra, pas de soie', () => {
    const c = resolveCapabilities(lv({ mining: 50 }), ch({ mining: 1 }));
    expect(c.fortuneExtra).toBe(true);
    expect(c.silkTouchChance).toBe(0);
  });
  test('mobilité 70 : Double Saut (choix 0) vs Dash (choix 1)', () => {
    expect(resolveCapabilities(lv({ agility: 70 }), ch({ agility: 0 })).doubleJump).toBe(true);
    expect(resolveCapabilities(lv({ agility: 70 }), ch({ agility: 1 })).dash).toBe(true);
  });
});
