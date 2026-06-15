import { type SkillRepository } from '../ports/skill-repository';
import { emptyState } from '../domain/skills/skill-state';

/**
 * CAS D'USAGE — initialisation idempotente d'un joueur.
 * Au tout premier enregistrement, on cale `maxVanillaLevel` sur le niveau courant pour
 * ne pas rétro-récompenser un joueur déjà expérimenté.
 */
export class InitPlayer {
  constructor(private readonly repo: SkillRepository) {}

  run(playerId: string, currentLevel: number): void {
    if (this.repo.isInitialized(playerId)) {
      return;
    }
    this.repo.save(playerId, { ...emptyState(), maxVanillaLevel: currentLevel });
  }
}
