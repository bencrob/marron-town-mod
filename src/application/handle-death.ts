import { type SkillRepository } from '../ports/skill-repository';
import { type Messenger } from '../ports/messenger';
import { applyDeath } from '../domain/death/death-rules';

/**
 * CAS D'USAGE — reset partiel à la mort, appliqué au respawn : perte des points
 * non-dépensés (niveaux et achats conservés), avec message si une perte a eu lieu.
 */
export class HandleDeath {
  constructor(
    private readonly repo: SkillRepository,
    private readonly messenger: Messenger,
  ) {}

  onRespawn(playerId: string): void {
    const { state, pointsLost } = applyDeath(this.repo.load(playerId));
    if (pointsLost > 0) {
      this.repo.save(playerId, state);
      this.messenger.sendTo(
        playerId,
        `§c☠️ Vous avez perdu §e${pointsLost} §cpoints non-dépensés à la mort.`,
      );
    }
  }
}
