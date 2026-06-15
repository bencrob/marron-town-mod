import { type Vector3 } from '@minecraft/server';

/**
 * Minerais éligibles (Vein Miner / Fortune / Silk) → item droppé en vanilla.
 * Inclut les variantes deepslate. La clé et la valeur sont des ids Minecraft complets.
 */
export const ORE_DROP: Readonly<Record<string, string>> = {
  'minecraft:coal_ore': 'minecraft:coal',
  'minecraft:deepslate_coal_ore': 'minecraft:coal',
  'minecraft:iron_ore': 'minecraft:raw_iron',
  'minecraft:deepslate_iron_ore': 'minecraft:raw_iron',
  'minecraft:gold_ore': 'minecraft:raw_gold',
  'minecraft:deepslate_gold_ore': 'minecraft:raw_gold',
  'minecraft:copper_ore': 'minecraft:raw_copper',
  'minecraft:deepslate_copper_ore': 'minecraft:raw_copper',
  'minecraft:diamond_ore': 'minecraft:diamond',
  'minecraft:deepslate_diamond_ore': 'minecraft:diamond',
  'minecraft:emerald_ore': 'minecraft:emerald',
  'minecraft:deepslate_emerald_ore': 'minecraft:emerald',
  'minecraft:lapis_ore': 'minecraft:lapis_lazuli',
  'minecraft:deepslate_lapis_ore': 'minecraft:lapis_lazuli',
  'minecraft:redstone_ore': 'minecraft:redstone',
  'minecraft:lit_redstone_ore': 'minecraft:redstone',
  'minecraft:deepslate_redstone_ore': 'minecraft:redstone',
  'minecraft:nether_gold_ore': 'minecraft:gold_nugget',
  'minecraft:quartz_ore': 'minecraft:quartz',
  'minecraft:ancient_debris': 'minecraft:ancient_debris',
};

export function isOre(typeId: string): boolean {
  return typeId in ORE_DROP;
}

/** Les 6 voisins orthogonaux d'une position de bloc. */
export function neighbors6(pos: Vector3): Vector3[] {
  return [
    { x: pos.x + 1, y: pos.y, z: pos.z },
    { x: pos.x - 1, y: pos.y, z: pos.z },
    { x: pos.x, y: pos.y + 1, z: pos.z },
    { x: pos.x, y: pos.y - 1, z: pos.z },
    { x: pos.x, y: pos.y, z: pos.z + 1 },
    { x: pos.x, y: pos.y, z: pos.z - 1 },
  ];
}

const keyOf = (p: Vector3): string => `${p.x},${p.y},${p.z}`;
export { keyOf };
