import { type PlayerSkillState } from '../skills/skill-state';
import { type SkillTree, MAX_SKILL_LEVEL } from '../skills/skill-types';

/**
 * DOMAINE PUR — dépense de points pour monter un arbre. 1 point = 1 niveau.
 */
export function canLevelUp(state: PlayerSkillState, tree: SkillTree, qty: number): boolean {
  return (
    qty > 0 &&
    state.unspentPoints >= qty &&
    state.levels[tree] + qty <= MAX_SKILL_LEVEL
  );
}

export interface SpendResult {
  readonly state: PlayerSkillState;
  readonly ok: boolean;
}

export function levelUpSkill(
  state: PlayerSkillState,
  tree: SkillTree,
  qty: number,
): SpendResult {
  if (!canLevelUp(state, tree, qty)) {
    return { state, ok: false };
  }
  return {
    state: {
      ...state,
      unspentPoints: state.unspentPoints - qty,
      levels: { ...state.levels, [tree]: state.levels[tree] + qty },
    },
    ok: true,
  };
}
