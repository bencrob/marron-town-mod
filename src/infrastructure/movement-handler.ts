import { world, system, type Player } from '@minecraft/server';
import { type SkillRepository } from '../ports/skill-repository';
import { resolveCapabilities, resolveCombatModifiers } from '../domain/perks/effect-resolver';
import { getHealth } from './entity-util';

const DASH_WINDOW_TICKS = 8; // ~0,4 s entre deux accroupissements
const DASH_COOLDOWN_TICKS = 240; // 12 s (nerf)
const SECOND_WIND_COOLDOWN_TICKS = 1800; // 90 s (nerf)

/**
 * Perks d'input détectés par polling rapide (faute d'events d'input) : double saut,
 * dash (double Sneak), second souffle (PV bas). État transitoire en mémoire.
 */
export class MovementHandler {
  private readonly airJumpUsed = new Set<string>();
  private readonly prevJumping = new Map<string, boolean>();
  private readonly prevSneaking = new Map<string, boolean>();
  private readonly lastSneakTick = new Map<string, number>();
  private readonly dashReadyAt = new Map<string, number>();
  private readonly secondWindReadyAt = new Map<string, number>();

  constructor(private readonly repo: SkillRepository) {}

  tick(): void {
    const now = system.currentTick;
    for (const player of world.getAllPlayers()) {
      const levels = this.repo.load(player.id).levels;
      const caps = resolveCapabilities(levels);
      const mods = resolveCombatModifiers(levels);
      this.doubleJump(player, caps.doubleJump);
      this.dash(player, caps.dash, mods.ghostDashInvuln, now);
      if (mods.secondWindActive) this.secondWind(player, now);
    }
  }

  private doubleJump(player: Player, enabled: boolean): void {
    const id = player.id;
    const onGround = player.isOnGround;
    const jumping = player.isJumping;

    if (onGround) {
      this.airJumpUsed.delete(id);
    } else if (enabled && jumping && !this.prevJumping.get(id) && !this.airJumpUsed.has(id)) {
      try {
        player.applyKnockback(0, 0, 0, 0.5);
        player.playSound('mob.bat.takeoff');
      } catch {
        /* ignore */
      }
      this.airJumpUsed.add(id);
    }
    this.prevJumping.set(id, jumping);
  }

  private dash(player: Player, enabled: boolean, invuln: boolean, now: number): void {
    const id = player.id;
    const sneaking = player.isSneaking;
    const rising = sneaking && !this.prevSneaking.get(id);
    this.prevSneaking.set(id, sneaking);
    if (!enabled || !rising) return;

    const last = this.lastSneakTick.get(id) ?? -9999;
    const ready = now >= (this.dashReadyAt.get(id) ?? 0);
    if (now - last <= DASH_WINDOW_TICKS && ready) {
      const dir = player.getViewDirection();
      try {
        player.applyKnockback(dir.x, dir.z, 1.2, 0.15);
        player.playSound('mob.enderdragon.flap');
        if (invuln) player.addEffect('resistance', 20, { amplifier: 255, showParticles: false });
      } catch {
        /* ignore */
      }
      this.dashReadyAt.set(id, now + DASH_COOLDOWN_TICKS);
      this.lastSneakTick.set(id, -9999); // évite un triple-tap
    } else {
      this.lastSneakTick.set(id, now);
    }
  }

  private secondWind(player: Player, now: number): void {
    const id = player.id;
    if (now < (this.secondWindReadyAt.get(id) ?? 0)) return;
    const hp = getHealth(player);
    if (!hp || hp.current <= 0 || hp.current / hp.max > 0.1) return;
    try {
      player.addEffect('absorption', 60, { amplifier: 0, showParticles: false });
      player.addEffect('regeneration', 60, { amplifier: 0, showParticles: false });
      player.onScreenDisplay.setActionBar('§6⚡ Second souffle !');
    } catch {
      /* ignore */
    }
    this.secondWindReadyAt.set(id, now + SECOND_WIND_COOLDOWN_TICKS);
  }
}
