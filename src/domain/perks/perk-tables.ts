import { type SkillTree } from '../skills/skill-types';

/**
 * DOMAINE PUR — paliers (milestones) par arbre, en DONNÉES (V2).
 * `kind` : 'effect' (défaut), 'loot' (donne un objet une fois), 'choice' (1 effet parmi 2).
 * Les niveaux changent désormais **tous les 10 points**.
 */
export type PerkKind = 'effect' | 'loot' | 'choice';

export interface PerkTier {
  readonly level: number;
  readonly name: string;
  readonly kind?: PerkKind;
}

export const PERK_TABLES: Readonly<Record<SkillTree, readonly PerkTier[]>> = {
  agility: [
    { level: 10, name: 'Vitesse (terre & nage)' },
    { level: 30, name: 'Livre Ruée III', kind: 'loot' },
    { level: 50, name: 'Endurance (moins de faim)' },
    { level: 70, name: 'Double Saut / Dash', kind: 'choice' },
    { level: 100, name: 'Renfort du choix' },
  ],
  attack: [
    { level: 20, name: 'Poison toutes les 10 frappes' },
    { level: 40, name: 'Critique léger (10 %)' },
    { level: 60, name: 'Faiblesse / Lenteur', kind: 'choice' },
    { level: 100, name: 'Renfort du choix' },
  ],
  defense: [
    { level: 10, name: 'Résistance' },
    { level: 20, name: 'Régén lente / Absorption', kind: 'choice' },
    { level: 40, name: '+2–3 cœurs' },
    { level: 60, name: 'Résistance au feu' },
    { level: 100, name: 'Renfort du choix' },
  ],
  mining: [
    { level: 10, name: 'Hâte' },
    { level: 20, name: 'Vein Miner' },
    { level: 30, name: 'Pioche en Fer (Solidité III)', kind: 'loot' },
    { level: 40, name: 'Auto-fonte des minerais' },
    { level: 50, name: 'Toucher de Soie / Fortune', kind: 'choice' },
    { level: 60, name: 'Détection de minerais' },
    { level: 80, name: 'Vision nocturne en mine' },
    { level: 100, name: 'Vein Miner étendu (20)' },
  ],
};

/** Paliers-loot : niveau → (item, enchantement) à donner une fois. */
export interface LootGrant {
  readonly tree: SkillTree;
  readonly level: number;
  readonly itemId: string;
  readonly enchantId: string;
  readonly enchantLevel: number;
}

export const LOOT_TIERS: readonly LootGrant[] = [
  { tree: 'mining', level: 30, itemId: 'minecraft:iron_pickaxe', enchantId: 'unbreaking', enchantLevel: 3 },
  { tree: 'agility', level: 30, itemId: 'minecraft:book', enchantId: 'swift_sneak', enchantLevel: 3 },
];
