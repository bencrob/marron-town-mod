import { type Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { type SkillRepository } from '../ports/skill-repository';
import { type WorldStore } from '../ports/world-store';
import { type Clock } from '../ports/clock';
import { type ItemService } from '../ports/item-service';
import {
  rotationIndex,
  isRotationStale,
  msUntilNextRotation,
  seededPick,
  type ShopOffer,
} from '../domain/shop/shop-rotation';
import { canBuy, applyPurchase } from '../domain/shop/purchase-rules';
import { isBought } from '../domain/shop/purchase-rules';
import { formatHHMM, SEPARATOR } from '../domain/ui/progress-bar';

const SEED_KEY = 'marrontown_shop_seed';
const TS_KEY = 'marrontown_shop_ts';
const SOUND = { open: 'random.click', buy: 'random.pop', error: 'note.bass' } as const;

/**
 * Boutique rotative 12h. La graine (monde) détermine la sélection ; les achats sont
 * « une fois par rotation par joueur » (masque réinitialisé quand le joueur découvre une
 * nouvelle rotation).
 */
export class ShopController {
  constructor(
    private readonly repo: SkillRepository,
    private readonly worldStore: WorldStore,
    private readonly clock: Clock,
    private readonly items: ItemService,
    private readonly backToMain: (player: Player) => Promise<void>,
  ) {}

  async open(player: Player): Promise<void> {
    const now = this.clock.nowMs();
    const offers = this.currentOffers(now);
    this.resetIfNewRotation(player.id, now);

    const mask = this.repo.getShopMask(player.id);
    const points = this.repo.load(player.id).unspentPoints;
    const rotation = formatHHMM(msUntilNextRotation(now));

    const form = new ActionFormData()
      .title(`§l§6Boutique — Rotation dans §e${rotation}`)
      .body(`${SEPARATOR}\n§e✦ ${points} points disponibles`);

    for (const offer of offers) {
      const color = offer.item.rarity === 'rare' ? '§b' : '§f';
      const status = isBought(mask, offer.slot) ? '§7[ACHETÉ]' : '§a[DISPO]';
      form.button(`${color}${offer.item.label} §e${offer.price} pts ${status}`);
    }
    form.button('§7← Retour');

    const res = await form.show(player);
    if (res.canceled || res.selection === undefined) return;
    if (res.selection >= offers.length) {
      await this.backToMain(player);
      return;
    }
    this.tryBuy(player, offers[res.selection]!);
    await this.open(player);
  }

  /** Sélection courante : reseed au niveau monde si la rotation est périmée. */
  private currentOffers(now: number): ShopOffer[] {
    let seed = this.worldStore.getNumber(SEED_KEY);
    const ts = this.worldStore.getNumber(TS_KEY) ?? 0;
    if (seed === undefined || isRotationStale(now, ts)) {
      seed = Math.floor(Math.random() * 0x7fffffff);
      this.worldStore.setNumber(SEED_KEY, seed);
      this.worldStore.setNumber(TS_KEY, now);
    }
    return seededPick(seed);
  }

  /** Réinitialise les achats du joueur s'il entre dans une nouvelle rotation. */
  private resetIfNewRotation(playerId: string, now: number): void {
    const current = rotationIndex(now);
    if (this.repo.getShopRotationSeen(playerId) !== current) {
      this.repo.setShopMask(playerId, 0);
      this.repo.setShopRotationSeen(playerId, current);
    }
  }

  private tryBuy(player: Player, offer: ShopOffer): void {
    const state = this.repo.load(player.id);
    const mask = this.repo.getShopMask(player.id);
    if (!canBuy(state.unspentPoints, offer.price, mask, offer.slot)) {
      player.playSound(SOUND.error);
      return;
    }
    const result = applyPurchase(state.unspentPoints, offer.price, mask, offer.slot);
    this.repo.save(player.id, { ...state, unspentPoints: result.unspentPoints });
    this.repo.setShopMask(player.id, result.mask);
    this.items.giveItem(player.id, offer.item.id, offer.item.count);
    player.playSound(SOUND.buy);
  }
}
