import { world } from '@minecraft/server';
import { type SkillRepository } from '../ports/skill-repository';
import { resolvePassiveEffects } from '../domain/perks/effect-resolver';

/**
 * Applique en boucle les effets passifs résolus (speed/haste/resistance…).
 * Durée 80 ticks > intervalle de 40 ticks → jamais d'interruption. Particules masquées
 * (anti-spam en multijoueur).
 */
export class PassiveApplier {
  constructor(private readonly repo: SkillRepository) {}

  tick(): void {
    for (const player of world.getAllPlayers()) {
      const { levels } = this.repo.load(player.id);
      for (const fx of resolvePassiveEffects(levels)) {
        try {
          player.addEffect(fx.effectId, 80, { amplifier: fx.amplifier, showParticles: false });
        } catch {
          // effet inconnu / joueur invalide : on ignore silencieusement
        }
      }
    }
  }
}
