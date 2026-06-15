import {
  Player,
  EntityDamageCause,
  type Entity,
  type EntityHurtAfterEvent,
} from '@minecraft/server';
import { type SkillRepository } from '../ports/skill-repository';
import { resolveCombatModifiers } from '../domain/perks/effect-resolver';
import { critSurplus, isExecutable } from '../domain/combat/damage-math';
import { getHealth, heal, hasShieldOffhand } from './entity-util';

/**
 * Gère l'event entityHurt : bonus offensifs (côté attaquant) et réduction hybride
 * (côté victime). Les dégâts bonus utilisent la cause `override` pour ne pas reboucler.
 */
export class CombatHandler {
  constructor(private readonly repo: SkillRepository) {}

  handle(event: EntityHurtAfterEvent): void {
    const { hurtEntity, damageSource, damage } = event;
    // Nos propres dégâts synthétiques : on ne les retraite pas (anti-récursion).
    if (damageSource.cause === EntityDamageCause.override || damage <= 0) return;
    this.handleAttacker(damageSource.damagingEntity, damageSource.cause, hurtEntity, damage);
    this.handleVictim(hurtEntity, damageSource.cause, damage);
  }

  private handleAttacker(
    attacker: Entity | undefined,
    cause: EntityDamageCause,
    victim: Entity,
    damage: number,
  ): void {
    if (!(attacker instanceof Player) || cause !== EntityDamageCause.entityAttack) return;
    const m = resolveCombatModifiers(this.repo.load(attacker.id).levels);

    let bonus = m.meleeFlatBonus;

    if (m.berserkerActive) {
      const hp = getHealth(attacker);
      if (hp && hp.current / hp.max < 0.3) bonus += damage * 0.2;
    }
    if (m.executeThreshold > 0) {
      const vh = getHealth(victim);
      if (vh && isExecutable(vh.current, vh.max, m.executeThreshold)) bonus += damage * m.executeBonus;
    }
    if (m.critChance > 0 && Math.random() < m.critChance) {
      bonus += critSurplus(damage + bonus, m.critMultiplier);
    }

    if (bonus > 0) {
      try {
        victim.applyDamage(bonus, { cause: EntityDamageCause.override, damagingEntity: attacker });
      } catch {
        /* victime invalide */
      }
    }
    if (m.bleedChance > 0 && Math.random() < m.bleedChance) {
      try {
        victim.addEffect('wither', 60, { amplifier: 0, showParticles: true });
      } catch {
        /* immunisé */
      }
    }
    if (m.heavyKnockbackChance > 0 && Math.random() < m.heavyKnockbackChance) {
      this.knockbackAway(attacker, victim);
    }
  }

  private handleVictim(victim: Entity, cause: EntityDamageCause, damage: number): void {
    if (!(victim instanceof Player)) return;
    const m = resolveCombatModifiers(this.repo.load(victim.id).levels);

    let healBack = 0;
    if (cause === EntityDamageCause.fall) {
      healBack = damage * m.fallDamageReductionPct;
    } else if (m.evasionChance > 0 && Math.random() < m.evasionChance) {
      healBack = damage; // esquive : on annule rétroactivement le coup
    } else {
      healBack = damage * m.healBackReductionPct;
      if (m.bastionShieldReductionPct > 0 && hasShieldOffhand(victim)) {
        healBack = Math.max(healBack, damage * m.bastionShieldReductionPct);
      }
    }

    if (healBack > 0) heal(victim, healBack);
  }

  private knockbackAway(attacker: Entity, victim: Entity): void {
    const dx = victim.location.x - attacker.location.x;
    const dz = victim.location.z - attacker.location.z;
    const len = Math.hypot(dx, dz) || 1;
    try {
      victim.applyKnockback(dx / len, dz / len, 1.5, 0.3);
    } catch {
      /* entité non déplaçable */
    }
  }
}
