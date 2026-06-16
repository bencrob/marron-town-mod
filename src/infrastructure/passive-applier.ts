import { world, type Player } from '@minecraft/server';
import { type SkillRepository } from '../ports/skill-repository';
import { resolvePassiveEffects, resolveCapabilities } from '../domain/perks/effect-resolver';
import { isOre } from './mining-util';

const MINE_Y = 50; // sous ce niveau Y, on considère « en mine » (vision nocturne)
const ORE_SCAN_RADIUS = 2; // petit rayon (perf) pour la détection de minerais

/**
 * Boucle passive (40 ticks) : effets passifs résolus + perks conditionnels
 * (vision nocturne en mine, endurance, détection de minerais). Durée 80 ticks > intervalle
 * → continuité. `suppressedUntil` permet au lait de couper 10 s (voir P2).
 */
export class PassiveApplier {
  /** Tick avant lequel on NE ré-applique PAS (lait, P2). */
  suppressedUntilTick = 0;

  constructor(private readonly repo: SkillRepository) {}

  tick(currentTick: number): void {
    if (currentTick < this.suppressedUntilTick) return;
    for (const player of world.getAllPlayers()) {
      const state = this.repo.load(player.id);
      for (const fx of resolvePassiveEffects(state.levels, state.choices)) {
        this.apply(player, fx.effectId, fx.amplifier);
      }
      const caps = resolveCapabilities(state.levels, state.choices);
      if (caps.endurance) this.apply(player, 'saturation', 0);
      if (caps.nightVisionMine && player.location.y < MINE_Y) this.apply(player, 'night_vision', 0);
      if (caps.oreDetection) this.detectOres(player);
    }
  }

  private apply(player: Player, effectId: string, amplifier: number): void {
    try {
      player.addEffect(effectId, 80, { amplifier, showParticles: false });
    } catch {
      /* effet inconnu / joueur invalide */
    }
  }

  /** Petit scan autour du joueur : particule verte sur les minerais proches. */
  private detectOres(player: Player): void {
    const { x, y, z } = player.location;
    const dim = player.dimension;
    for (let dx = -ORE_SCAN_RADIUS; dx <= ORE_SCAN_RADIUS; dx++) {
      for (let dy = -ORE_SCAN_RADIUS; dy <= ORE_SCAN_RADIUS; dy++) {
        for (let dz = -ORE_SCAN_RADIUS; dz <= ORE_SCAN_RADIUS; dz++) {
          const loc = { x: Math.floor(x) + dx, y: Math.floor(y) + dy, z: Math.floor(z) + dz };
          try {
            const block = dim.getBlock(loc);
            if (block && isOre(block.typeId)) {
              dim.spawnParticle('minecraft:villager_happy', {
                x: loc.x + 0.5,
                y: loc.y + 0.5,
                z: loc.z + 0.5,
              });
            }
          } catch {
            /* chunk non chargé */
          }
        }
      }
    }
  }
}
