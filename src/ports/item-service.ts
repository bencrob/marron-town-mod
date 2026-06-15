/**
 * PORT — gestion d'objets dans l'inventaire d'un joueur (donner / vérifier la présence).
 */
export interface ItemService {
  hasItem(playerId: string, itemId: string): boolean;
  giveItem(playerId: string, itemId: string, count?: number): void;
}
