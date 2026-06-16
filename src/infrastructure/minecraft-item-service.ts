import {
  ItemStack,
  EntityComponentTypes,
  ItemComponentTypes,
  EnchantmentTypes,
} from '@minecraft/server';
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

  brandGrimoire(playerId: string, grimoireIds: readonly string[]): void {
    const player = findPlayer(playerId);
    const container = player?.getComponent(EntityComponentTypes.Inventory)?.container;
    if (!player || !container) return;
    const slot = player.selectedSlotIndex;
    const stack = container.getItem(slot);
    if (!stack || !grimoireIds.includes(stack.typeId) || stack.nameTag) return;
    stack.nameTag = `§6Grimoire de ${player.name}`;
    container.setItem(slot, stack);
  }

  hasAnyItem(playerId: string, itemIds: readonly string[]): boolean {
    const container = this.container(playerId);
    if (!container) return false;
    for (let slot = 0; slot < container.size; slot++) {
      const id = container.getItem(slot)?.typeId;
      if (id && itemIds.includes(id)) return true;
    }
    return false;
  }

  swapHeldVariant(playerId: string, grimoireIds: readonly string[], toId: string): void {
    const player = findPlayer(playerId);
    const container = player?.getComponent(EntityComponentTypes.Inventory)?.container;
    if (!player || !container) return;
    const slot = player.selectedSlotIndex;
    const stack = container.getItem(slot);
    if (!stack || !grimoireIds.includes(stack.typeId)) return;
    const next = new ItemStack(toId, 1);
    if (stack.nameTag) next.nameTag = stack.nameTag;
    container.setItem(slot, next);
  }

  giveEnchantedItem(playerId: string, itemId: string, enchantId: string, level: number): void {
    const container = this.container(playerId);
    if (!container) return;
    const stack = new ItemStack(itemId, 1);
    try {
      const ench = stack.getComponent(ItemComponentTypes.Enchantable);
      const type = EnchantmentTypes.get(enchantId);
      if (ench && type) ench.addEnchantment({ type, level });
    } catch {
      /* enchantement incompatible : on donne l'objet nu */
    }
    container.addItem(stack);
  }

  countItem(playerId: string, itemId: string): number {
    const container = this.container(playerId);
    if (!container) return 0;
    let total = 0;
    for (let slot = 0; slot < container.size; slot++) {
      const item = container.getItem(slot);
      if (item?.typeId === itemId) total += item.amount;
    }
    return total;
  }

  removeItem(playerId: string, itemId: string, count: number): boolean {
    const container = this.container(playerId);
    if (!container || this.countItem(playerId, itemId) < count) return false;
    let remaining = count;
    for (let slot = 0; slot < container.size && remaining > 0; slot++) {
      const item = container.getItem(slot);
      if (item?.typeId !== itemId) continue;
      const take = Math.min(item.amount, remaining);
      remaining -= take;
      if (item.amount > take) {
        item.amount -= take;
        container.setItem(slot, item);
      } else {
        container.setItem(slot); // vide le slot
      }
    }
    return true;
  }

  private container(playerId: string) {
    const player = findPlayer(playerId);
    const inventory = player?.getComponent(EntityComponentTypes.Inventory);
    return inventory?.container;
  }
}
