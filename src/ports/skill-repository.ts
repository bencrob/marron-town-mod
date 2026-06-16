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

  /** Masque 5 bits des achats boutique de la rotation courante. */
  getShopMask(playerId: string): number;
  setShopMask(playerId: string, mask: number): void;

  /** Le joueur a-t-il déjà possédé un Grimoire (pour le rendre à la mort) ? */
  hasOwnedGrimoire(playerId: string): boolean;
  markGrimoireOwned(playerId: string): void;

  /** Index de rotation boutique vu par le joueur (pour réinitialiser ses achats). */
  getShopRotationSeen(playerId: string): number;
  setShopRotationSeen(playerId: string, rotation: number): void;

  /** Loot de palier déjà réclamé (donné une seule fois). */
  hasClaimedLoot(playerId: string, key: string): boolean;
  markClaimedLoot(playerId: string, key: string): void;
}
