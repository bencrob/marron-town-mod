import { type SkillRepository } from '../ports/skill-repository';
import { emptyState } from '../domain/skills/skill-state';
import { START_POINTS } from '../domain/points/points-from-level';

/**
 * CAS D'USAGE — initialisation idempotente d'un joueur.
 * Au tout premier enregistrement : on offre les points de départ et on cale
 * `maxVanillaLevel` sur le niveau courant (pas de rétro-récompense XP).
 */
export class InitPlayer {
  constructor(private readonly repo: SkillRepository) {}

  run(playerId: string, currentLevel: number): void {
    if (this.repo.isInitialized(playerId)) {
      return;
    }
    this.repo.save(playerId, {
      ...emptyState(),
      unspentPoints: START_POINTS,
      totalPointsEarned: START_POINTS,
      maxVanillaLevel: currentLevel,
    });
  }
}
