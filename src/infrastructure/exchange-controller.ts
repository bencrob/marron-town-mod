import { type Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { type SkillRepository } from '../ports/skill-repository';
import { type Clock } from '../ports/clock';
import { type ItemService } from '../ports/item-service';
import { FIXED_EXCHANGES, type ExchangeOffer } from '../domain/exchange/exchange-catalog';
import { pickDailyBonus, dayIndex, msUntilNextDay } from '../domain/exchange/exchange-rules';
import { formatHHMM, SEPARATOR } from '../domain/ui/progress-bar';

const SOUND = { ok: 'random.pop', error: 'note.bass' } as const;

/**
 * Échange ressources → points : offres fixes + 1 offre bonus quotidienne (1×/jour).
 * Source de progression au-delà du plafond XP (90 pts).
 */
export class ExchangeController {
  constructor(
    private readonly repo: SkillRepository,
    private readonly clock: Clock,
    private readonly items: ItemService,
    private readonly backToMain: (player: Player) => Promise<void>,
  ) {}

  async open(player: Player): Promise<void> {
    const now = this.clock.nowMs();
    const day = dayIndex(now);
    const bonus = pickDailyBonus(day);
    const bonusClaimed = this.repo.getExchangeBonusDay(player.id) === day;
    const points = this.repo.load(player.id).unspentPoints;

    const form = new ActionFormData()
      .title(`§l§6Échange — Bonus renouvelé dans §e${formatHHMM(msUntilNextDay(now))}`)
      .body(`${SEPARATOR}\n§e✦ ${points} pts disponibles\n§7Donne des ressources, reçois des points.`);

    for (const o of FIXED_EXCHANGES) form.button(`${o.label} §7→ §e+${o.points} pts`);
    form.button(`${bonusClaimed ? '§7[déjà fait] ' : '§b★ '}Bonus : ${bonus.label} §7→ §e+${bonus.points} pts`);
    form.button('§7← Retour');

    const res = await form.show(player);
    if (res.canceled || res.selection === undefined) return;

    const fixedCount = FIXED_EXCHANGES.length;
    if (res.selection < fixedCount) {
      this.tryExchange(player, FIXED_EXCHANGES[res.selection]!, day, false);
      await this.open(player);
    } else if (res.selection === fixedCount) {
      this.tryExchange(player, bonus, day, true);
      await this.open(player);
    } else {
      await this.backToMain(player);
    }
  }

  private tryExchange(player: Player, offer: ExchangeOffer, day: number, isBonus: boolean): void {
    if (isBonus && this.repo.getExchangeBonusDay(player.id) === day) {
      player.playSound(SOUND.error);
      player.sendMessage('§cBonus quotidien déjà utilisé aujourd’hui.');
      return;
    }
    if (!this.items.removeItem(player.id, offer.itemId, offer.count)) {
      player.playSound(SOUND.error);
      player.sendMessage(`§cIl te faut ${offer.label} dans l’inventaire.`);
      return;
    }
    const state = this.repo.load(player.id);
    this.repo.save(player.id, {
      ...state,
      unspentPoints: state.unspentPoints + offer.points,
      totalPointsEarned: state.totalPointsEarned + offer.points,
    });
    if (isBonus) this.repo.setExchangeBonusDay(player.id, day);
    player.playSound(SOUND.ok);
    player.sendMessage(`§a+${offer.points} points de compétence !`);
  }
}
