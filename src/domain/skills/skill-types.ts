/**
 * DOMAINE PUR — types fondamentaux des compétences. Zéro import @minecraft/*.
 */
export const SKILL_TREES = ['agility', 'attack', 'defense', 'mining'] as const;
export type SkillTree = (typeof SKILL_TREES)[number];

export const MAX_SKILL_LEVEL = 100;

/**
 * Métadonnées d'affichage par arbre — données pures.
 * `icon` = emoji (texte des menus) ; `iconPath` = texture vanilla affichée sur les boutons.
 */
export const SKILL_META: Readonly<
  Record<SkillTree, { label: string; icon: string; iconPath: string }>
> = {
  agility: { label: 'Agilité', icon: '🥾', iconPath: 'textures/items/diamond_boots' },
  attack: { label: 'Attaque', icon: '🗡️', iconPath: 'textures/items/diamond_sword' },
  defense: { label: 'Résistance', icon: '💗', iconPath: 'textures/items/marrontown_regen' },
  mining: { label: 'Minage', icon: '⛏️', iconPath: 'textures/items/diamond_pickaxe' },
};
