import { type SkillRepository } from '../ports/skill-repository';
import { type PlayerSkillState } from '../domain/skills/skill-state';
import { readScore, writeScore } from './scoreboard-util';

/** Noms d'objectifs (spec). */
const OBJ = {
  points: 'marrontown_points',
  total: 'marrontown_pts_total',
  agility: 'marrontown_agility',
  attack: 'marrontown_attack',
  defense: 'marrontown_defense',
  mining: 'marrontown_mining',
  maxLevel: 'marrontown_max_level',
  ownedGrimoire: 'marrontown_owned_grimoire',
  shopRot: 'marrontown_shop_rot',
} as const;

const SHOP_SLOT_OBJ = (slot: number): string => `marrontown_shop_b_${slot}`;

/**
 * ADAPTATEUR — persistance de l'état joueur via scoreboards (survit aux redémarrages).
 */
export class ScoreboardSkillRepository implements SkillRepository {
  load(playerId: string): PlayerSkillState {
    return {
      unspentPoints: readScore(OBJ.points, playerId) ?? 0,
      totalPointsEarned: readScore(OBJ.total, playerId) ?? 0,
      levels: {
        agility: readScore(OBJ.agility, playerId) ?? 0,
        attack: readScore(OBJ.attack, playerId) ?? 0,
        defense: readScore(OBJ.defense, playerId) ?? 0,
        mining: readScore(OBJ.mining, playerId) ?? 0,
      },
      maxVanillaLevel: readScore(OBJ.maxLevel, playerId) ?? 0,
    };
  }

  save(playerId: string, state: PlayerSkillState): void {
    writeScore(OBJ.points, playerId, state.unspentPoints);
    writeScore(OBJ.total, playerId, state.totalPointsEarned);
    writeScore(OBJ.agility, playerId, state.levels.agility);
    writeScore(OBJ.attack, playerId, state.levels.attack);
    writeScore(OBJ.defense, playerId, state.levels.defense);
    writeScore(OBJ.mining, playerId, state.levels.mining);
    writeScore(OBJ.maxLevel, playerId, state.maxVanillaLevel);
  }

  isInitialized(playerId: string): boolean {
    return readScore(OBJ.maxLevel, playerId) !== undefined;
  }

  getShopMask(playerId: string): number {
    let mask = 0;
    for (let slot = 0; slot < 5; slot++) {
      if ((readScore(SHOP_SLOT_OBJ(slot), playerId) ?? 0) !== 0) {
        mask |= 1 << slot;
      }
    }
    return mask;
  }

  setShopMask(playerId: string, mask: number): void {
    for (let slot = 0; slot < 5; slot++) {
      writeScore(SHOP_SLOT_OBJ(slot), playerId, (mask >> slot) & 1);
    }
  }

  hasOwnedGrimoire(playerId: string): boolean {
    return (readScore(OBJ.ownedGrimoire, playerId) ?? 0) !== 0;
  }

  markGrimoireOwned(playerId: string): void {
    writeScore(OBJ.ownedGrimoire, playerId, 1);
  }

  getShopRotationSeen(playerId: string): number {
    return readScore(OBJ.shopRot, playerId) ?? -1;
  }

  setShopRotationSeen(playerId: string, rotation: number): void {
    writeScore(OBJ.shopRot, playerId, rotation);
  }
}
