/**
 * DOMAINE PUR — types fondamentaux des compétences. Zéro import @minecraft/*.
 */
export const SKILL_TREES = ['agility', 'attack', 'defense', 'mining'] as const;
export type SkillTree = (typeof SKILL_TREES)[number];

export const MAX_SKILL_LEVEL = 100;

/**
 * Métadonnées d'affichage par arbre — données pures.
 * `icon` = emoji (texte) ; `iconPath` = texture vanilla affichée sur les boutons.
 */
export const SKILL_META: Readonly<
  Record<SkillTree, { label: string; icon: string; iconPath: string }>
> = {
  agility: { label: 'Mobilité', icon: '🪶', iconPath: 'textures/items/feather' },
  attack: { label: 'Attaque', icon: '⚔️', iconPath: 'textures/items/iron_sword' },
  defense: { label: 'Résistance', icon: '🛡️', iconPath: 'textures/items/shield' },
  mining: { label: 'Minage', icon: '⛏️', iconPath: 'textures/items/iron_pickaxe' },
};

/**
 * Palier où le joueur choisit 1 effet parmi 2 (figé jusqu'au reset).
 * `labels[0]` = choix 0, `labels[1]` = choix 1.
 */
export const SKILL_CHOICE: Readonly<
  Record<SkillTree, { tier: number; labels: readonly [string, string] }>
> = {
  agility: { tier: 70, labels: ['Double Saut', 'Dash'] },
  attack: { tier: 60, labels: ['Faiblesse', 'Lenteur'] },
  defense: { tier: 20, labels: ['Régén lente', 'Absorption'] },
  mining: { tier: 50, labels: ['Toucher de Soie', 'Fortune'] },
};
