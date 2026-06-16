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
const CHOICE_OBJ = (tree: string): string => `marrontown_choice_${tree}`;
const LOOT_OBJ = (key: string): string => `marrontown_loot_${key}`;

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
      // Stockage brut 0 = non choisi (→ option A par défaut), 1 = A, 2 = B.
      choices: {
        agility: this.choiceIndex('agility', playerId),
        attack: this.choiceIndex('attack', playerId),
        defense: this.choiceIndex('defense', playerId),
        mining: this.choiceIndex('mining', playerId),
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
    // Les choix ont leur propre cycle de vie (setChoiceMade/clearChoices), pas via save().
  }

  /** Index d'effet choisi (0/1) : 0 par défaut tant que non choisi. */
  private choiceIndex(tree: string, playerId: string): number {
    return (readScore(CHOICE_OBJ(tree), playerId) ?? 0) === 2 ? 1 : 0;
  }

  isChoiceMade(playerId: string, tree: string): boolean {
    return (readScore(CHOICE_OBJ(tree), playerId) ?? 0) !== 0;
  }

  setChoiceMade(playerId: string, tree: string, idx: number): void {
    writeScore(CHOICE_OBJ(tree), playerId, idx === 1 ? 2 : 1);
  }

  clearChoices(playerId: string): void {
    for (const tree of ['agility', 'attack', 'defense', 'mining']) {
      writeScore(CHOICE_OBJ(tree), playerId, 0);
    }
  }

  getTheme(playerId: string): number {
    return readScore('marrontown_theme', playerId) ?? 0;
  }

  setTheme(playerId: string, theme: number): void {
    writeScore('marrontown_theme', playerId, theme);
  }

  hasClaimedLoot(playerId: string, key: string): boolean {
    return (readScore(LOOT_OBJ(key), playerId) ?? 0) !== 0;
  }

  markClaimedLoot(playerId: string, key: string): void {
    writeScore(LOOT_OBJ(key), playerId, 1);
  }

  getExchangeBonusDay(playerId: string): number {
    return readScore('marrontown_exch_day', playerId) ?? -1;
  }

  setExchangeBonusDay(playerId: string, day: number): void {
    writeScore('marrontown_exch_day', playerId, day);
  }

  isInitialized(playerId: string): boolean {
    return readScore(OBJ.maxLevel, playerId) !== undefined;
  }

  getShopBuyCount(playerId: string, slot: number): number {
    return readScore(SHOP_SLOT_OBJ(slot), playerId) ?? 0;
  }

  setShopBuyCount(playerId: string, slot: number, count: number): void {
    writeScore(SHOP_SLOT_OBJ(slot), playerId, count);
  }

  resetShopBuys(playerId: string): void {
    for (let slot = 0; slot < 5; slot++) writeScore(SHOP_SLOT_OBJ(slot), playerId, 0);
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
