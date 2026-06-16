import { type ItemService } from '../ports/item-service';
import { type SkillRepository } from '../ports/skill-repository';
import { GRIMOIRE_IDS } from '../domain/skills/grimoire-variants';

export const GRIMOIRE_ID = 'marrontown:skill_grimoire';

/**
 * CAS D'USAGE — « le Grimoire est conservé à la mort ».
 * On marque la possession dès que le joueur l'utilise, et on le redonne au respawn
 * s'il a disparu de l'inventaire. (Un joueur qui ne l'a jamais possédé n'en reçoit pas.)
 */
export class EnsureGrimoire {
  constructor(
    private readonly items: ItemService,
    private readonly repo: SkillRepository,
  ) {}

  /** Appelé quand le joueur utilise le Grimoire → il le possède. */
  onUse(playerId: string): void {
    this.repo.markGrimoireOwned(playerId);
  }

  /** Appelé au respawn : rend le Grimoire si le joueur en possédait un et l'a perdu. */
  onRespawn(playerId: string): void {
    if (this.repo.hasOwnedGrimoire(playerId) && !this.items.hasAnyItem(playerId, GRIMOIRE_IDS)) {
      this.items.giveItem(playerId, GRIMOIRE_ID, 1);
    }
  }
}
