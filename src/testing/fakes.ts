import { type SkillRepository } from '../ports/skill-repository';
import { type Messenger } from '../ports/messenger';
import { type PlayerQuery, type OnlinePlayer } from '../ports/player-query';
import { type WorldStore } from '../ports/world-store';
import { type Clock } from '../ports/clock';
import { type ItemService } from '../ports/item-service';
import { type PlayerSkillState, emptyState } from '../domain/skills/skill-state';

/** Doublures en mémoire pour tester les cas d'usage sans Minecraft. */

export class InMemorySkillRepository implements SkillRepository {
  private readonly states = new Map<string, PlayerSkillState>();
  private readonly masks = new Map<string, number>();
  private readonly owned = new Set<string>();

  private readonly rawChoices = new Map<string, number>();
  load(playerId: string): PlayerSkillState {
    const base = this.states.get(playerId) ?? emptyState();
    const idx = (tree: string) => ((this.rawChoices.get(`${playerId}:${tree}`) ?? 0) === 2 ? 1 : 0);
    return {
      ...base,
      choices: { agility: idx('agility'), attack: idx('attack'), defense: idx('defense'), mining: idx('mining') },
    };
  }
  isChoiceMade(playerId: string, tree: string): boolean {
    return (this.rawChoices.get(`${playerId}:${tree}`) ?? 0) !== 0;
  }
  setChoiceMade(playerId: string, tree: string, idx: number): void {
    this.rawChoices.set(`${playerId}:${tree}`, idx === 1 ? 2 : 1);
  }
  clearChoices(playerId: string): void {
    for (const tree of ['agility', 'attack', 'defense', 'mining']) {
      this.rawChoices.delete(`${playerId}:${tree}`);
    }
  }
  save(playerId: string, state: PlayerSkillState): void {
    this.states.set(playerId, state);
  }
  isInitialized(playerId: string): boolean {
    return this.states.has(playerId);
  }
  getShopMask(playerId: string): number {
    return this.masks.get(playerId) ?? 0;
  }
  setShopMask(playerId: string, mask: number): void {
    this.masks.set(playerId, mask);
  }
  hasOwnedGrimoire(playerId: string): boolean {
    return this.owned.has(playerId);
  }
  markGrimoireOwned(playerId: string): void {
    this.owned.add(playerId);
  }
  private readonly rotationSeen = new Map<string, number>();
  getShopRotationSeen(playerId: string): number {
    return this.rotationSeen.get(playerId) ?? -1;
  }
  setShopRotationSeen(playerId: string, rotation: number): void {
    this.rotationSeen.set(playerId, rotation);
  }
  private readonly claimedLoot = new Set<string>();
  hasClaimedLoot(playerId: string, key: string): boolean {
    return this.claimedLoot.has(`${playerId}:${key}`);
  }
  markClaimedLoot(playerId: string, key: string): void {
    this.claimedLoot.add(`${playerId}:${key}`);
  }
  private readonly exchBonusDay = new Map<string, number>();
  getExchangeBonusDay(playerId: string): number {
    return this.exchBonusDay.get(playerId) ?? -1;
  }
  setExchangeBonusDay(playerId: string, day: number): void {
    this.exchBonusDay.set(playerId, day);
  }
}

export class FakeItemService implements ItemService {
  /** itemId présents par joueur. */
  readonly inventories = new Map<string, Map<string, number>>();

  hasItem(playerId: string, itemId: string): boolean {
    return (this.inventories.get(playerId)?.get(itemId) ?? 0) > 0;
  }
  giveItem(playerId: string, itemId: string, count = 1): void {
    const inv = this.inventories.get(playerId) ?? new Map<string, number>();
    inv.set(itemId, (inv.get(itemId) ?? 0) + count);
    this.inventories.set(playerId, inv);
  }
  readonly branded: { id: string; itemId: string }[] = [];
  brandGrimoire(playerId: string, itemId: string): void {
    this.branded.push({ id: playerId, itemId });
  }
  giveEnchantedItem(playerId: string, itemId: string, _enchantId: string, _level: number): void {
    this.giveItem(playerId, itemId, 1);
  }
  countItem(playerId: string, itemId: string): number {
    return this.inventories.get(playerId)?.get(itemId) ?? 0;
  }
  removeItem(playerId: string, itemId: string, count: number): boolean {
    const inv = this.inventories.get(playerId);
    const have = inv?.get(itemId) ?? 0;
    if (!inv || have < count) return false;
    inv.set(itemId, have - count);
    return true;
  }
}

export class SpyMessenger implements Messenger {
  readonly actionBars: { id: string; msg: string }[] = [];
  readonly chats: { id: string; msg: string }[] = [];
  readonly broadcasts: string[] = [];

  actionBar(playerId: string, message: string): void {
    this.actionBars.push({ id: playerId, msg: message });
  }
  sendTo(playerId: string, message: string): void {
    this.chats.push({ id: playerId, msg: message });
  }
  broadcast(message: string): void {
    this.broadcasts.push(message);
  }
}

export class StubPlayerQuery implements PlayerQuery {
  constructor(public players: OnlinePlayer[] = []) {}
  getOnlinePlayers(): OnlinePlayer[] {
    return this.players;
  }
  getName(playerId: string): string | undefined {
    return this.players.find((p) => p.id === playerId)?.name;
  }
}

export class InMemoryWorldStore implements WorldStore {
  private readonly map = new Map<string, number>();
  getNumber(key: string): number | undefined {
    return this.map.get(key);
  }
  setNumber(key: string, value: number): void {
    this.map.set(key, value);
  }
}

export class FakeClock implements Clock {
  constructor(public tick = 0, public ms = 0) {}
  currentTick(): number {
    return this.tick;
  }
  nowMs(): number {
    return this.ms;
  }
}
