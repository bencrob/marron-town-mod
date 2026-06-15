import {
  type Entity,
  type Player,
  EntityComponentTypes,
  EquipmentSlot,
} from '@minecraft/server';

/** PV courants / max effectifs d'une entité (composant santé), ou undefined si absent. */
export function getHealth(entity: Entity): { current: number; max: number } | undefined {
  const health = entity.getComponent(EntityComponentTypes.Health);
  if (!health) return undefined;
  return { current: health.currentValue, max: health.effectiveMax };
}

/** Soigne une entité de `amount` PV, plafonné au max. */
export function heal(entity: Entity, amount: number): void {
  const health = entity.getComponent(EntityComponentTypes.Health);
  if (!health) return;
  health.setCurrentValue(Math.min(health.effectiveMax, health.currentValue + amount));
}

/** Le joueur tient-il un bouclier en main secondaire ? */
export function hasShieldOffhand(player: Player): boolean {
  const eq = player.getComponent(EntityComponentTypes.Equippable);
  return eq?.getEquipment(EquipmentSlot.Offhand)?.typeId === 'minecraft:shield';
}
