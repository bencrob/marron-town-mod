import { type PlayerQuery } from '../ports/player-query';
import { type SkillRepository } from '../ports/skill-repository';
import { type Messenger } from '../ports/messenger';
import { pointsForCrossing } from '../domain/points/points-from-level';

/**
 * CAS D'USAGE — attribution des points de compétence à partir de l'XP vanilla.
 * Appelé périodiquement (polling, faute d'event playerLevelChange). Anti-farm via
 * le niveau max persité dans l'état.
 */
export class AwardSkillPoints {
  constructor(
    private readonly players: PlayerQuery,
    private readonly repo: SkillRepository,
    private readonly messenger: Messenger,
  ) {}

  run(): void {
    for (const player of this.players.getOnlinePlayers()) {
      const state = this.repo.load(player.id);
      const award = pointsForCrossing(state.maxVanillaLevel, player.level);

      // Rien de nouveau : ni montée au-delà du max, ni palier franchi.
      if (award.newMax === state.maxVanillaLevel) {
        continue;
      }

      const next = {
        ...state,
        maxVanillaLevel: award.newMax,
        unspentPoints: state.unspentPoints + award.pointsAwarded,
        totalPointsEarned: state.totalPointsEarned + award.pointsAwarded,
      };
      this.repo.save(player.id, next);

      if (award.pointsAwarded > 0) {
        const plural = award.pointsAwarded > 1 ? 's' : '';
        this.messenger.actionBar(
          player.id,
          `§6✦ +${award.pointsAwarded} Point${plural} de compétence §7| Total disponible : §e${next.unspentPoints} pts`,
        );
      }
    }
  }
}
