import { type SkillTree } from '../skills/skill-types';

/**
 * DOMAINE PUR (V2) — à partir des niveaux + choix d'un joueur, calcule les effets passifs,
 * les modificateurs de combat et les capacités. Paliers tous les 10, magnitudes réduites,
 * 1 effet choisi parmi 2 par arbre. Entièrement testable.
 */
type Levels = Readonly<Record<SkillTree, number>>;
type Choices = Readonly<Record<SkillTree, number>>;

const NO_CHOICE: Choices = { agility: 0, attack: 0, defense: 0, mining: 0 };

export interface PassiveEffect {
  readonly effectId: string;
  readonly amplifier: number;
}

export interface CombatModifiers {
  /** > 0 : toutes les N frappes → Poison I (0 = désactivé). */
  readonly poisonEveryHits: number;
  readonly critChance: number;
  readonly critMultiplier: number;
  /** Débuff appliqué sur coup selon le choix Attaque (ou null si non débloqué). */
  readonly debuffEffect: 'weakness' | 'slowness' | null;
  readonly debuffChance: number;
}

export interface Capabilities {
  // Minage
  readonly veinMiner: boolean;
  readonly veinMinerMax: number;
  readonly autoSmelt: boolean;
  readonly oreDetection: boolean;
  readonly nightVisionMine: boolean;
  readonly silkTouchChance: number;
  readonly fortuneExtra: boolean;
  // Mobilité
  readonly doubleJump: boolean;
  readonly dash: boolean;
  readonly mobilityMax: boolean; // renfort niv.100
  readonly endurance: boolean;
}

/** Effets passifs (speed/haste/resistance/regen/absorption/fire_resistance/health_boost). */
export function resolvePassiveEffects(levels: Levels, choices: Choices = NO_CHOICE): PassiveEffect[] {
  const { agility: ag, defense: de, mining: mi } = levels;
  const fx: PassiveEffect[] = [];

  // Mobilité : vitesse légère (II seulement au 70), aide aussi à la nage.
  if (ag >= 10) fx.push({ effectId: 'speed', amplifier: ag >= 70 ? 1 : 0 });

  // Résistance : résistance, choix régén/absorption, cœurs, anti-feu.
  if (de >= 10) fx.push({ effectId: 'resistance', amplifier: de >= 70 ? 1 : 0 });
  if (de >= 20) {
    fx.push({ effectId: choices.defense === 1 ? 'absorption' : 'regeneration', amplifier: de >= 100 ? 1 : 0 });
  }
  if (de >= 40) fx.push({ effectId: 'health_boost', amplifier: 0 }); // ~+2 cœurs (≤ +3 visé)
  if (de >= 60) fx.push({ effectId: 'fire_resistance', amplifier: 0 });

  // Minage : haste plafonné à II (jamais de cassage instantané → anims préservées).
  if (mi >= 10) fx.push({ effectId: 'haste', amplifier: mi >= 50 ? 1 : 0 });

  // Fusion par effet (amplificateur max) au cas où.
  const byId = new Map<string, number>();
  for (const e of fx) byId.set(e.effectId, Math.max(byId.get(e.effectId) ?? -1, e.amplifier));
  return [...byId].map(([effectId, amplifier]) => ({ effectId, amplifier }));
}

export function resolveCombatModifiers(levels: Levels, choices: Choices = NO_CHOICE): CombatModifiers {
  const at = levels.attack;
  return {
    poisonEveryHits: at >= 20 ? 10 : 0,
    critChance: at >= 40 ? 0.1 : 0,
    critMultiplier: 1.5,
    debuffEffect: at >= 60 ? (choices.attack === 1 ? 'slowness' : 'weakness') : null,
    debuffChance: at >= 100 ? 0.25 : at >= 60 ? 0.15 : 0,
  };
}

export function resolveCapabilities(levels: Levels, choices: Choices = NO_CHOICE): Capabilities {
  const { agility: ag, mining: mi } = levels;
  return {
    veinMiner: mi >= 20,
    veinMinerMax: mi >= 100 ? 20 : 12,
    autoSmelt: mi >= 40,
    oreDetection: mi >= 60,
    nightVisionMine: mi >= 80,
    silkTouchChance: mi >= 50 && choices.mining === 0 ? 0.4 : 0,
    fortuneExtra: mi >= 50 && choices.mining === 1,
    doubleJump: ag >= 70 && choices.agility === 0,
    dash: ag >= 70 && choices.agility === 1,
    mobilityMax: ag >= 100,
    endurance: ag >= 50,
  };
}
