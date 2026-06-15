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

describe('resolvePassiveEffects', () => {
  test('aucun niveau → aucun effet', () => {
    expect(resolvePassiveEffects(levels({}))).toEqual([]);
  });

  test('agilité 30 → speed amp 3 + jump_boost amp 1', () => {
    const fx = resolvePassiveEffects(levels({ agility: 30 }));
    expect(amp(fx, 'speed')).toBe(3);
    expect(amp(fx, 'jump_boost')).toBe(1);
  });

  test('haste fusionné entre attaque et minage → amplificateur max', () => {
    const fx = resolvePassiveEffects(levels({ attack: 40, mining: 100 }));
    // attack>=40 → haste 1 ; mining 100 → haste min(10,5)=5 ; max = 5
    expect(amp(fx, 'haste')).toBe(5);
    expect(fx.filter((e) => e.effectId === 'haste')).toHaveLength(1);
  });

  test('résistance 80 → resistance/regen/absorption/fire_resistance', () => {
    const fx = resolvePassiveEffects(levels({ defense: 80 }));
    expect(amp(fx, 'resistance')).toBe(3);
    expect(amp(fx, 'regeneration')).toBe(1);
    expect(amp(fx, 'absorption')).toBe(0);
    expect(amp(fx, 'fire_resistance')).toBe(0);
  });
});

describe('resolveCombatModifiers', () => {
  test('attaque 100 → crit x2, bonus plat 5', () => {
    const m = resolveCombatModifiers(levels({ attack: 100 }));
    expect(m.meleeFlatBonus).toBeCloseTo(5);
    expect(m.critChance).toBe(0.25);
    expect(m.critMultiplier).toBe(2);
  });

  test('résistance 9 → 9 % heal-back, pas de second souffle', () => {
    const m = resolveCombatModifiers(levels({ defense: 9 }));
    expect(m.healBackReductionPct).toBeCloseTo(0.09);
    expect(m.secondWindActive).toBe(false);
  });

  test('agilité 50 → chute totalement annulée', () => {
    expect(resolveCombatModifiers(levels({ agility: 50 })).fallDamageReductionPct).toBe(1);
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
