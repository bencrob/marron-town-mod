/**
 * DOMAINE PUR — types fondamentaux des compétences. Zéro import @minecraft/*.
 */
export const SKILL_TREES = ['agility', 'attack', 'defense', 'mining'] as const;
export type SkillTree = (typeof SKILL_TREES)[number];

export const MAX_SKILL_LEVEL = 100;

/** Métadonnées d'affichage par arbre (label + icône) — données pures. */
export const SKILL_META: Readonly<Record<SkillTree, { label: string; icon: string }>> = {
  agility: { label: 'Agilité', icon: '⚡' },
  attack: { label: 'Attaque', icon: '⚔️' },
  defense: { label: 'Résistance', icon: '🛡️' },
  mining: { label: 'Minage', icon: '⛏️' },
};
