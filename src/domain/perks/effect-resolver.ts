import { type SkillTree } from '../skills/skill-types';

/**
 * DOMAINE PUR — « cerveau » des compétences : à partir des niveaux d'un joueur,
 * calcule les effets passifs Minecraft, les modificateurs de combat et les capacités
 * actives. Recalculé périodiquement par la boucle de jeu. Entièrement testable.
 */
type Levels = Readonly<Record<SkillTree, number>>;

export interface PassiveEffect {
  readonly effectId: string;
  readonly amplifier: number;
}

export interface CombatModifiers {
  // Attaque
  readonly meleeFlatBonus: number;
  readonly critChance: number;
  readonly critMultiplier: number;
  readonly bleedChance: number;
  readonly heavyKnockbackChance: number;
  readonly berserkerActive: boolean; // bonus appliqué si HP < 30 %
  readonly executeThreshold: number; // cible sous ce % HP → bonus exécution
  readonly executeBonus: number;
  // Résistance (réduction « fine » résiduelle via heal-back ; la grosse maille passe
  // par l'effet resistance des passifs)
  readonly healBackReductionPct: number;
  readonly bastionShieldReductionPct: number; // si bouclier en offhand
  readonly secondWindActive: boolean;
  // Agilité
  readonly fallDamageReductionPct: number;
  readonly evasionChance: number;
  readonly ghostDashInvuln: boolean;
}

export interface Capabilities {
  readonly doubleJump: boolean;
  readonly dash: boolean;
  readonly veinMiner: boolean;
  readonly veinMinerMax: number;
  readonly silkTouchChance: number;
  readonly fortuneChance: number; // 1 = garanti
  readonly explosiveMining: boolean;
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Effets passifs à (ré)appliquer ; doublons fusionnés en gardant l'amplificateur max. */
export function resolvePassiveEffects(levels: Levels): PassiveEffect[] {
  const { agility: ag, attack: at, defense: de, mining: mi } = levels;
  const raw: PassiveEffect[] = [];

  if (ag >= 1) raw.push({ effectId: 'speed', amplifier: clamp(Math.floor(ag / 10), 0, 5) });
  if (ag >= 20) raw.push({ effectId: 'jump_boost', amplifier: 1 });

  if (at >= 10) raw.push({ effectId: 'haste', amplifier: at >= 40 ? 1 : 0 });

  if (de >= 10) raw.push({ effectId: 'resistance', amplifier: clamp(Math.floor(de / 25), 0, 4) });
  if (de >= 20) raw.push({ effectId: 'regeneration', amplifier: de >= 50 ? 1 : 0 });
  if (de >= 40) raw.push({ effectId: 'absorption', amplifier: 0 });
  if (de >= 60) raw.push({ effectId: 'fire_resistance', amplifier: 0 });

  if (mi >= 1) raw.push({ effectId: 'haste', amplifier: clamp(Math.floor(mi / 10), 0, 5) });

  // Fusion par effet : amplificateur maximum.
  const byId = new Map<string, number>();
  for (const fx of raw) {
    byId.set(fx.effectId, Math.max(byId.get(fx.effectId) ?? -1, fx.amplifier));
  }
  return [...byId].map(([effectId, amplifier]) => ({ effectId, amplifier }));
}

export function resolveCombatModifiers(levels: Levels): CombatModifiers {
  const { agility: ag, attack: at, defense: de } = levels;
  return {
    meleeFlatBonus: at * 0.05,
    critChance: at >= 50 ? 0.25 : 0,
    critMultiplier: at >= 100 ? 2 : 1.5,
    bleedChance: at >= 30 ? 0.2 : 0,
    heavyKnockbackChance: at >= 20 ? 0.15 : 0,
    berserkerActive: at >= 60,
    executeThreshold: at >= 75 ? 0.15 : 0,
    executeBonus: 0.5,
    healBackReductionPct: Math.min(de, 9) * 0.01,
    bastionShieldReductionPct: de >= 75 ? 0.95 : 0,
    secondWindActive: de >= 100,
    fallDamageReductionPct: ag >= 50 ? 1 : ag >= 10 ? 0.2 : 0,
    evasionChance: ag >= 60 ? 0.15 : 0,
    ghostDashInvuln: ag >= 100,
  };
}

export function resolveCapabilities(levels: Levels): Capabilities {
  const { agility: ag, mining: mi } = levels;
  return {
    doubleJump: ag >= 30,
    dash: ag >= 75,
    veinMiner: mi >= 20,
    veinMinerMax: mi >= 100 ? 20 : 12,
    silkTouchChance: mi >= 30 ? 0.4 : 0,
    fortuneChance: mi >= 75 ? 1 : mi >= 35 ? 0.5 : 0,
    explosiveMining: mi >= 60,
  };
}
