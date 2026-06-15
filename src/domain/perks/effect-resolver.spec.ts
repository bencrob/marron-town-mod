import { describe, test, expect } from 'vitest';
import {
  resolvePassiveEffects,
  resolveCombatModifiers,
  resolveCapabilities,
} from './effect-resolver';

const levels = (p: Partial<Record<'agility' | 'attack' | 'defense' | 'mining', number>>) => ({
  agility: 0,
  attack: 0,
  defense: 0,
  mining: 0,
  ...p,
});

const amp = (fx: { effectId: string; amplifier: number }[], id: string) =>
  fx.find((e) => e.effectId === id)?.amplifier;

describe('resolvePassiveEffects (nerf modéré)', () => {
  test('aucun niveau → aucun effet', () => {
    expect(resolvePassiveEffects(levels({}))).toEqual([]);
  });

  test('agilité 30 → Speed I (amp 0) + Jump I (amp 0)', () => {
    const fx = resolvePassiveEffects(levels({ agility: 30 }));
    expect(amp(fx, 'speed')).toBe(0);
    expect(amp(fx, 'jump_boost')).toBe(0);
  });

  test('agilité 40 → Speed II (amp 1)', () => {
    expect(amp(resolvePassiveEffects(levels({ agility: 40 })), 'speed')).toBe(1);
  });

  test('haste plafonné à I (amp 1) même attaque 40 + minage 100', () => {
    const fx = resolvePassiveEffects(levels({ attack: 40, mining: 100 }));
    expect(amp(fx, 'haste')).toBe(1);
    expect(fx.filter((e) => e.effectId === 'haste')).toHaveLength(1);
  });

  test('résistance 80 → Resist II (amp 1) + regen/absorption/fire', () => {
    const fx = resolvePassiveEffects(levels({ defense: 80 }));
    expect(amp(fx, 'resistance')).toBe(1);
    expect(amp(fx, 'regeneration')).toBe(0);
    expect(amp(fx, 'absorption')).toBe(0);
    expect(amp(fx, 'fire_resistance')).toBe(0);
  });
});

describe('resolveCombatModifiers (nerf modéré)', () => {
  test('attaque 100 → crit ×1,75, bonus plat +2', () => {
    const m = resolveCombatModifiers(levels({ attack: 100 }));
    expect(m.meleeFlatBonus).toBeCloseTo(2);
    expect(m.critChance).toBe(0.15);
    expect(m.critMultiplier).toBe(1.75);
  });

  test('réduction fine plafonnée à 5 %', () => {
    expect(resolveCombatModifiers(levels({ defense: 9 })).healBackReductionPct).toBeCloseTo(0.05);
    expect(resolveCombatModifiers(levels({ defense: 3 })).healBackReductionPct).toBeCloseTo(0.03);
  });

  test('chute : −50 % à 50, annulée à 100', () => {
    expect(resolveCombatModifiers(levels({ agility: 50 })).fallDamageReductionPct).toBe(0.5);
    expect(resolveCombatModifiers(levels({ agility: 100 })).fallDamageReductionPct).toBe(1);
  });

  test('évasion 10 % à 60', () => {
    expect(resolveCombatModifiers(levels({ agility: 60 })).evasionChance).toBe(0.1);
  });

  test('Bastion 60 % et Second Souffle à 100 de résistance', () => {
    const m = resolveCombatModifiers(levels({ defense: 100 }));
    expect(m.bastionShieldReductionPct).toBe(0.6);
    expect(m.secondWindActive).toBe(true);
  });
});

describe('resolveCapabilities', () => {
  test('minage 100 → vein miner étendu, fortune garantie, explosif', () => {
    const c = resolveCapabilities(levels({ mining: 100 }));
    expect(c.veinMiner).toBe(true);
    expect(c.veinMinerMax).toBe(20);
    expect(c.fortuneChance).toBe(1);
    expect(c.explosiveMining).toBe(true);
  });

  test('agilité 75 → double saut + dash', () => {
    const c = resolveCapabilities(levels({ agility: 75 }));
    expect(c.doubleJump).toBe(true);
    expect(c.dash).toBe(true);
  });
});
