/**
 * PORT — gestion d'objets dans l'inventaire d'un joueur (donner / vérifier la présence).
 */
export interface ItemService {
  hasItem(playerId: string, itemId: string): boolean;
  giveItem(playerId: string, itemId: string, count?: number): void;
  /** Renomme l'objet tenu « Grimoire de [joueur] » s'il n'a pas encore de nom. */
  brandGrimoire(playerId: string, itemId: string): void;
  /** Donne un objet enchanté (paliers-loot). */
  giveEnchantedItem(playerId: string, itemId: string, enchantId: string, level: number): void;
}
