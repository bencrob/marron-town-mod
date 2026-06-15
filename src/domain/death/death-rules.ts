import { type PlayerSkillState } from '../skills/skill-state';

/**
 * DOMAINE PUR — reset partiel à la mort.
 * Conserve les niveaux achetés et le total gagné ; perd les points non-dépensés.
 */
export interface DeathResult {
  readonly state: PlayerSkillState;
  readonly pointsLost: number;
}

export function applyDeath(state: PlayerSkillState): DeathResult {
  return {
    state: { ...state, unspentPoints: 0 },
    pointsLost: state.unspentPoints,
  };
}
