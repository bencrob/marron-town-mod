import { ItemStack, EntityComponentTypes } from '@minecraft/server';
import { type ItemService } from '../ports/item-service';
import { findPlayer } from './player-finder';

/** ADAPTATEUR — inventaire Minecraft. */
export class MinecraftItemService implements ItemService {
  hasItem(playerId: string, itemId: string): boolean {
    const container = this.container(playerId);
    if (!container) return false;
    for (let slot = 0; slot < container.size; slot++) {
      if (container.getItem(slot)?.typeId === itemId) {
        return true;
      }
    }
    return false;
  }

  giveItem(playerId: string, itemId: string, count = 1): void {
    const container = this.container(playerId);
    container?.addItem(new ItemStack(itemId, count));
  }

  private container(playerId: string) {
    const player = findPlayer(playerId);
    const inventory = player?.getComponent(EntityComponentTypes.Inventory);
    return inventory?.container;
  }
}
