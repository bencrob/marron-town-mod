import { type SkillRepository } from '../ports/skill-repository';
import { SKILL_TREES } from '../domain/skills/skill-types';

export const ERASER_ID = 'marrontown:skill_eraser';

/**
 * CAS D'USAGE — réinitialisation (respec) via la Gomme.
 * Remet les niveaux à 0, rend TOUS les points gagnés en disponibles, et déverrouille les choix.
 * Le niveau XP max et les loots déjà donnés sont conservés.
 */
export class ResetSkills {
  constructor(private readonly repo: SkillRepository) {}

  /** @returns le nombre de points redevenus dépensables (points auparavant dépensés). */
  run(playerId: string): number {
    const state = this.repo.load(playerId);
    const freed = state.totalPointsEarned - state.unspentPoints;
    const levels = {} as Record<(typeof SKILL_TREES)[number], number>;
    for (const tree of SKILL_TREES) levels[tree] = 0;
    this.repo.save(playerId, { ...state, levels, unspentPoints: state.totalPointsEarned });
    this.repo.clearChoices(playerId);
    return freed;
  }
}
