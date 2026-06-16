import { world, system, type Player } from '@minecraft/server';
import { type SkillRepository } from '../ports/skill-repository';
import { resolveCapabilities } from '../domain/perks/effect-resolver';

const DASH_WINDOW_TICKS = 8; // ~0,4 s entre deux accroupissements

/**
 * Perks de mobilité (poll rapide) : Double Saut OU Dash selon le choix de l'arbre.
 * Renfort au niveau 100 (`mobilityMax`) : poussée plus forte / recharge réduite.
 */
export class MovementHandler {
  private readonly airJumpUsed = new Set<string>();
  private readonly prevJumping = new Map<string, boolean>();
  private readonly prevSneaking = new Map<string, boolean>();
  private readonly lastSneakTick = new Map<string, number>();
  private readonly dashReadyAt = new Map<string, number>();

  constructor(private readonly repo: SkillRepository) {}

  tick(): void {
    const now = system.currentTick;
    for (const player of world.getAllPlayers()) {
      const state = this.repo.load(player.id);
      const caps = resolveCapabilities(state.levels, state.choices);
      if (caps.doubleJump) this.doubleJump(player, caps.mobilityMax);
      if (caps.dash) this.dash(player, caps.mobilityMax, now);
    }
  }

  private doubleJump(player: Player, strong: boolean): void {
    const id = player.id;
    const jumping = player.isJumping;
    if (player.isOnGround) {
      this.airJumpUsed.delete(id);
    } else if (jumping && !this.prevJumping.get(id) && !this.airJumpUsed.has(id)) {
      try {
        player.applyKnockback(0, 0, 0, strong ? 0.65 : 0.5);
        player.playSound('mob.bat.takeoff');
      } catch {
        /* ignore */
      }
      this.airJumpUsed.add(id);
    }
    this.prevJumping.set(id, jumping);
  }

  private dash(player: Player, strong: boolean, now: number): void {
    const id = player.id;
    const sneaking = player.isSneaking;
    const rising = sneaking && !this.prevSneaking.get(id);
    this.prevSneaking.set(id, sneaking);
    if (!rising) return;

    const cooldown = strong ? 160 : 240; // 8 s renforcé, sinon 12 s
    const last = this.lastSneakTick.get(id) ?? -9999;
    if (now - last <= DASH_WINDOW_TICKS && now >= (this.dashReadyAt.get(id) ?? 0)) {
      const dir = player.getViewDirection();
      try {
        player.applyKnockback(dir.x, dir.z, strong ? 1.4 : 1.2, 0.15);
        player.playSound('mob.enderdragon.flap');
      } catch {
        /* ignore */
      }
      this.dashReadyAt.set(id, now + cooldown);
      this.lastSneakTick.set(id, -9999);
    } else {
      this.lastSneakTick.set(id, now);
    }
  }
}
