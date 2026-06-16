import {
  system,
  ItemStack,
  type Dimension,
  type Vector3,
  type PlayerBreakBlockAfterEvent,
} from '@minecraft/server';
import { type SkillRepository } from '../ports/skill-repository';
import { resolveCapabilities } from '../domain/perks/effect-resolver';
import { isOre, dropFor, neighbors6, keyOf } from './mining-util';

const VEIN_COOLDOWN_TICKS = 10; // 0,5 s par joueur (anti-lag)

/**
 * Perks de minage V2 sur playerBreakBlock : Auto-fonte, Toucher de Soie / Fortune (au choix),
 * Vein Miner. (Détection de minerais et vision nocturne sont gérées par la boucle passive.)
 * Les drops ajoutés sont additifs (le drop vanilla d'origine n'est pas annulable en after-event).
 */
export class MiningHandler {
  private readonly lastVein = new Map<string, number>();

  constructor(private readonly repo: SkillRepository) {}

  handle(event: PlayerBreakBlockAfterEvent): void {
    const { player } = event;
    const state = this.repo.load(player.id);
    const caps = resolveCapabilities(state.levels, state.choices);
    const oreId = event.brokenBlockPermutation.type.id;
    if (!isOre(oreId)) return;

    const dim = event.dimension;
    const origin = event.block.location;

    // Bonus sur le bloc d'origine (additif).
    this.applyDrops(dim, origin, oreId, caps, event.brokenBlockPermutation.getItemStack(1));

    // Vein Miner : casse la veine et contrôle entièrement ses drops.
    if (caps.veinMiner) {
      const now = system.currentTick;
      if (now - (this.lastVein.get(player.id) ?? -9999) >= VEIN_COOLDOWN_TICKS) {
        this.lastVein.set(player.id, now);
        this.veinMine(dim, origin, oreId, caps);
      }
    }
  }

  /** Soie (drop du bloc) OU fonte/normal, +1 si Fortune. */
  private applyDrops(
    dim: Dimension,
    pos: Vector3,
    oreId: string,
    caps: ReturnType<typeof resolveCapabilities>,
    blockStack: ItemStack | undefined,
  ): void {
    if (caps.silkTouchChance > 0 && Math.random() < caps.silkTouchChance) {
      if (blockStack) dim.spawnItem(blockStack, pos);
      return;
    }
    const drop = dropFor(oreId, caps.autoSmelt);
    if (!drop) return;
    const count = caps.fortuneExtra ? 2 : 1;
    dim.spawnItem(new ItemStack(drop, count), pos);
  }

  private veinMine(
    dim: Dimension,
    origin: Vector3,
    oreId: string,
    caps: ReturnType<typeof resolveCapabilities>,
  ): void {
    const visited = new Set<string>([keyOf(origin)]);
    const queue: Vector3[] = [origin];
    let broken = 0;
    while (queue.length > 0 && broken < caps.veinMinerMax) {
      const cur = queue.shift();
      if (!cur) break;
      for (const n of neighbors6(cur)) {
        if (broken >= caps.veinMinerMax) break;
        const k = keyOf(n);
        if (visited.has(k)) continue;
        visited.add(k);
        const block = dim.getBlock(n);
        if (!block || block.typeId !== oreId) continue;
        const blockStack = block.permutation.getItemStack(1);
        block.setType('minecraft:air');
        broken++;
        this.applyDrops(dim, n, oreId, caps, blockStack);
        queue.push(n);
      }
    }
  }
}
