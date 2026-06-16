import { type PlayerSkillState } from '../domain/skills/skill-state';

/**
 * PORT — persistance de l'état de compétence d'un joueur (au-dessus des scoreboards).
 * Clé = identifiant joueur (string). Les valeurs manquantes se lisent comme 0/défaut.
 */
export interface SkillRepository {
  /** Charge l'état ; renvoie l'état vide si le joueur est inconnu. */
  load(playerId: string): PlayerSkillState;
  /** Persiste l'intégralité de l'état. */
  save(playerId: string, state: PlayerSkillState): void;
  /** Vrai si le joueur a déjà un enregistrement (pour l'init baseline). */
  isInitialized(playerId: string): boolean;

  /** Nombre d'achats effectués pour un slot boutique de la rotation courante. */
  getShopBuyCount(playerId: string, slot: number): number;
  setShopBuyCount(playerId: string, slot: number, count: number): void;
  /** Remet à zéro les compteurs d'achat (nouvelle rotation). */
  resetShopBuys(playerId: string): void;

  /** Le joueur a-t-il déjà possédé un Grimoire (pour le rendre à la mort) ? */
  hasOwnedGrimoire(playerId: string): boolean;
  markGrimoireOwned(playerId: string): void;

  /** Index de rotation boutique vu par le joueur (pour réinitialiser ses achats). */
  getShopRotationSeen(playerId: string): number;
  setShopRotationSeen(playerId: string, rotation: number): void;

  /** Loot de palier déjà réclamé (donné une seule fois). */
  hasClaimedLoot(playerId: string, key: string): boolean;
  markClaimedLoot(playerId: string, key: string): void;

  /** Dernier jour où le bonus d'échange quotidien a été réclamé (-1 = jamais). */
  getExchangeBonusDay(playerId: string): number;
  setExchangeBonusDay(playerId: string, day: number): void;

  /** Choix d'effet (figé une fois fait, jusqu'au reset). */
  isChoiceMade(playerId: string, tree: string): boolean;
  setChoiceMade(playerId: string, tree: string, idx: number): void;
  clearChoices(playerId: string): void;
}
