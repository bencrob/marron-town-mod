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
import { canBuy, applyPurchase, maxBuysFor } from '../domain/shop/purchase-rules';
import { formatHHMM, SEPARATOR } from '../domain/ui/progress-bar';

const SEED_KEY = 'marrontown_shop_seed';
const TS_KEY = 'marrontown_shop_ts';
const SOUND = { buy: 'random.pop', error: 'note.bass' } as const;

/**
 * Boutique rotative quotidienne (24h). Graine monde déterministe ; achats 1–3×/jour selon
 * la rareté (compteur par slot remis à 0 à la rotation). Temps restant affiché à l'ouverture.
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

    const points = this.repo.load(player.id).unspentPoints;
    const form = new ActionFormData()
      .title(`§l§6Boutique — Rotation dans §e${formatHHMM(msUntilNextRotation(now))}`)
      .body(`${SEPARATOR}\n§e✦ ${points} points disponibles`);

    for (const offer of offers) {
      const max = maxBuysFor(offer.item.rarity);
      const bought = this.repo.getShopBuyCount(player.id, offer.slot);
      const color = offer.item.rarity === 'rare' ? '§b' : '§f';
      form.button(`${color}${offer.item.label} §e${offer.price} pts §7[${bought}/${max}]`, offer.item.icon);
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

  /** Sélection courante : reseed monde si la rotation (24h) est périmée. */
  private currentOffers(now: number): ShopOffer[] {
    let seed = this.worldStore.getNumber(SEED_KEY);
    const ts = (this.worldStore.getNumber(TS_KEY) ?? 0) * 1000; // stocké en secondes
    if (seed === undefined || isRotationStale(now, ts)) {
      seed = Math.floor(Math.random() * 0x7fffffff);
      this.worldStore.setNumber(SEED_KEY, seed);
      this.worldStore.setNumber(TS_KEY, Math.floor(now / 1000));
    }
    return seededPick(seed);
  }

  private resetIfNewRotation(playerId: string, now: number): void {
    const current = rotationIndex(now);
    if (this.repo.getShopRotationSeen(playerId) !== current) {
      this.repo.resetShopBuys(playerId);
      this.repo.setShopRotationSeen(playerId, current);
    }
  }

  private tryBuy(player: Player, offer: ShopOffer): void {
    const state = this.repo.load(player.id);
    const max = maxBuysFor(offer.item.rarity);
    const bought = this.repo.getShopBuyCount(player.id, offer.slot);
    if (!canBuy(state.unspentPoints, offer.price, bought, max)) {
      player.playSound(SOUND.error);
      return;
    }
    const result = applyPurchase(state.unspentPoints, offer.price, bought, max);
    this.repo.save(player.id, { ...state, unspentPoints: result.unspentPoints });
    this.repo.setShopBuyCount(player.id, offer.slot, result.boughtCount);
    this.items.giveItem(player.id, offer.item.id, offer.item.count);
    player.playSound(SOUND.buy);
  }
}
