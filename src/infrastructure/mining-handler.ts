import {
  system,
  ItemStack,
  type Dimension,
  type Vector3,
  type PlayerBreakBlockAfterEvent,
} from '@minecraft/server';
import { type SkillRepository } from '../ports/skill-repository';
import { resolveCapabilities } from '../domain/perks/effect-resolver';
import { ORE_DROP, isOre, neighbors6, keyOf } from './mining-util';

const VEIN_COOLDOWN_TICKS = 10; // 0,5 s par joueur (anti-lag)

/**
 * Perks de minage sur playerBreakBlock : Toucher de Soie, Fortune, Vein Miner, Minage
 * Explosif (en accroupi). Les drops sont régénérés via spawnItem.
 */
export class MiningHandler {
  private readonly lastVein = new Map<string, number>();

  constructor(private readonly repo: SkillRepository) {}

  handle(event: PlayerBreakBlockAfterEvent): void {
    const { player } = event;
    const caps = resolveCapabilities(this.repo.load(player.id).levels);
    const oreId = event.brokenBlockPermutation.type.id;
    const dim = event.dimension;
    const origin = event.block.location;

    if (isOre(oreId)) {
      if (caps.silkTouchChance > 0 && Math.random() < caps.silkTouchChance) {
        const stack = event.brokenBlockPermutation.getItemStack(1);
        if (stack) dim.spawnItem(stack, origin);
      } else if (
        caps.fortuneChance > 0 &&
        (caps.fortuneChance >= 1 || Math.random() < caps.fortuneChance)
      ) {
        const drop = ORE_DROP[oreId];
        if (drop) dim.spawnItem(new ItemStack(drop, 1), origin);
      }

      if (caps.veinMiner) {
        const now = system.currentTick;
        if (now - (this.lastVein.get(player.id) ?? -9999) >= VEIN_COOLDOWN_TICKS) {
          this.lastVein.set(player.id, now);
          this.veinMine(dim, origin, oreId, caps.veinMinerMax, caps.fortuneChance >= 1);
        }
      }
    }

    if (caps.explosiveMining && player.isSneaking) {
      this.explosive(dim, origin, player.getViewDirection());
    }
  }

  /** Flood-fill BFS du même minerai, plafonné à `max` blocs. */
  private veinMine(
    dim: Dimension,
    origin: Vector3,
    oreId: string,
    max: number,
    fortuneGuaranteed: boolean,
  ): void {
    const visited = new Set<string>([keyOf(origin)]);
    const queue: Vector3[] = [origin];
    let broken = 0;

    while (queue.length > 0 && broken < max) {
      const cur = queue.shift();
      if (!cur) break;
      for (const n of neighbors6(cur)) {
        if (broken >= max) break;
        const k = keyOf(n);
        if (visited.has(k)) continue;
        visited.add(k);
        const block = dim.getBlock(n);
        if (!block || block.typeId !== oreId) continue;
        block.setType('minecraft:air');
        broken++;
        const drop = ORE_DROP[oreId];
        if (drop) dim.spawnItem(new ItemStack(drop, fortuneGuaranteed ? 2 : 1), n);
        queue.push(n);
      }
    }
  }

  /** Casse les 2 blocs latéraux (perpendiculaires au regard) → 3 de large avec l'origine. */
  private explosive(dim: Dimension, origin: Vector3, view: Vector3): void {
    const horizontalFacing = Math.abs(view.x) >= Math.abs(view.z);
    const sides: Vector3[] = horizontalFacing
      ? [
          { x: origin.x, y: origin.y, z: origin.z + 1 },
          { x: origin.x, y: origin.y, z: origin.z - 1 },
        ]
      : [
          { x: origin.x + 1, y: origin.y, z: origin.z },
          { x: origin.x - 1, y: origin.y, z: origin.z },
        ];

    for (const pos of sides) {
      const block = dim.getBlock(pos);
      if (!block) continue;
      const id = block.typeId;
      if (id === 'minecraft:air' || id === 'minecraft:bedrock') continue;
      const stack = block.permutation.getItemStack(1);
      block.setType('minecraft:air');
      if (stack) dim.spawnItem(stack, pos);
    }
  }
}
