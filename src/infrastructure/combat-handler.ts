import {
  Player,
  EntityDamageCause,
  type Entity,
  type EntityHurtAfterEvent,
} from '@minecraft/server';
import { type SkillRepository } from '../ports/skill-repository';
import { resolveCombatModifiers } from '../domain/perks/effect-resolver';
import { critSurplus } from '../domain/combat/damage-math';

/**
 * Combat V2 (arbre Attaque = effets, plus de gros dégâts) :
 *  - Poison I toutes les 10 frappes réussies ;
 *  - petit critique (×1,5) ;
 *  - débuff au choix (Faiblesse/Lenteur) pendant 3–5 s, selon la chance.
 * La défense passe entièrement par l'effet `resistance` (passifs), donc pas de volet victime.
 */
export class CombatHandler {
  private readonly hitCount = new Map<string, number>();

  constructor(private readonly repo: SkillRepository) {}

  handle(event: EntityHurtAfterEvent): void {
    const { hurtEntity, damageSource, damage } = event;
    if (damageSource.cause === EntityDamageCause.override || damage <= 0) return;
    const attacker = damageSource.damagingEntity;
    if (!(attacker instanceof Player) || damageSource.cause !== EntityDamageCause.entityAttack) return;

    const state = this.repo.load(attacker.id);
    const m = resolveCombatModifiers(state.levels, state.choices);

    // Poison toutes les N frappes.
    if (m.poisonEveryHits > 0) {
      const n = (this.hitCount.get(attacker.id) ?? 0) + 1;
      this.hitCount.set(attacker.id, n);
      if (n % m.poisonEveryHits === 0) this.tryEffect(hurtEntity, 'poison', 60, 0);
    }

    // Critique léger : surplus de dégâts (cause override pour ne pas reboucler).
    if (m.critChance > 0 && Math.random() < m.critChance) {
      try {
        hurtEntity.applyDamage(critSurplus(damage, m.critMultiplier), {
          cause: EntityDamageCause.override,
          damagingEntity: attacker,
        });
      } catch {
        /* victime invalide */
      }
    }

    // Débuff au choix, 3–5 s.
    if (m.debuffEffect && m.debuffChance > 0 && Math.random() < m.debuffChance) {
      const ticks = 60 + Math.floor(Math.random() * 41); // 60–100 ticks = 3–5 s
      this.tryEffect(hurtEntity, m.debuffEffect, ticks, 0);
    }
  }

  private tryEffect(target: Entity, effectId: string, ticks: number, amplifier: number): void {
    try {
      target.addEffect(effectId, ticks, { amplifier, showParticles: true });
    } catch {
      /* cible immunisée / invalide */
    }
  }
}
