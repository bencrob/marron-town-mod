import { type SkillTree, SKILL_TREES } from './skill-types';

/**
 * DOMAINE PUR — état de progression d'un joueur (value object immuable).
 * Deux seules sources de vérité métier : ce que le joueur a gagné/dépensé.
 */
export interface PlayerSkillState {
  /** Points disponibles non-dépensés. */
  readonly unspentPoints: number;
  /** Total de points jamais gagnés (jamais décrémenté). */
  readonly totalPointsEarned: number;
  /** Niveau de chaque arbre (0–100). */
  readonly levels: Readonly<Record<SkillTree, number>>;
  /** Choix d'effet par arbre (0 ou 1), figé jusqu'au reset. */
  readonly choices: Readonly<Record<SkillTree, number>>;
  /** Niveau Minecraft le plus haut jamais atteint (anti-farm). */
  readonly maxVanillaLevel: number;
}

export function emptyState(): PlayerSkillState {
  const levels = {} as Record<SkillTree, number>;
  const choices = {} as Record<SkillTree, number>;
  for (const tree of SKILL_TREES) {
    levels[tree] = 0;
    choices[tree] = 0;
  }
  return { unspentPoints: 0, totalPointsEarned: 0, levels, choices, maxVanillaLevel: 0 };
}

/** Niveau moyen des 4 arbres (pour l'affichage du menu principal). */
export function averageLevel(state: PlayerSkillState): number {
  const sum = SKILL_TREES.reduce((acc, tree) => acc + state.levels[tree], 0);
  return Math.round(sum / SKILL_TREES.length);
}

/** Points dépensés = total gagné − disponibles. */
export function spentPoints(state: PlayerSkillState): number {
  return state.totalPointsEarned - state.unspentPoints;
}
