/**
 * PORT — gestion d'objets dans l'inventaire d'un joueur (donner / vérifier la présence).
 */
export interface ItemService {
  hasItem(playerId: string, itemId: string): boolean;
  giveItem(playerId: string, itemId: string, count?: number): void;
  /** Renomme le grimoire tenu (toute variante) « Grimoire de [joueur] » s'il n'a pas de nom. */
  brandGrimoire(playerId: string, grimoireIds: readonly string[]): void;
  /** Vrai si l'inventaire contient au moins un des items donnés. */
  hasAnyItem(playerId: string, itemIds: readonly string[]): boolean;
  /** Remplace le grimoire tenu par la variante `toId` (conserve le nom personnalisé). */
  swapHeldVariant(playerId: string, grimoireIds: readonly string[], toId: string): void;
  /** Donne un objet enchanté (paliers-loot). */
  giveEnchantedItem(playerId: string, itemId: string, enchantId: string, level: number): void;
  /** Nombre total de cet item dans l'inventaire. */
  countItem(playerId: string, itemId: string): number;
  /** Retire `count` exemplaires si disponibles ; renvoie false sinon (rien retiré). */
  removeItem(playerId: string, itemId: string, count: number): boolean;
}
