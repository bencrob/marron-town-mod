import { world, system, type Player } from '@minecraft/server';
import { ScoreboardSkillRepository } from './infrastructure/scoreboard-skill-repository';
import { ScoreboardWorldStore } from './infrastructure/scoreboard-world-store';
import { MinecraftMessenger } from './infrastructure/minecraft-messenger';
import { MinecraftPlayerQuery } from './infrastructure/minecraft-player-query';
import { MinecraftItemService } from './infrastructure/minecraft-item-service';
import { MinecraftClock } from './infrastructure/minecraft-clock';
import { MenuController } from './infrastructure/menu-controller';
import { ShopController } from './infrastructure/shop-controller';
import { ExchangeController } from './infrastructure/exchange-controller';
import { PassiveApplier } from './infrastructure/passive-applier';
import { CombatHandler } from './infrastructure/combat-handler';
import { MovementHandler } from './infrastructure/movement-handler';
import { MiningHandler } from './infrastructure/mining-handler';
import { InitPlayer } from './application/init-player';
import { AwardSkillPoints } from './application/award-skill-points';
import { EnsureGrimoire, GRIMOIRE_ID } from './application/ensure-grimoire';
import { HandleDeath } from './application/handle-death';
import { ResetSkills, ERASER_ID } from './application/reset-skills';
import { GRIMOIRE_IDS } from './domain/skills/grimoire-variants';

// --- Composition root : instancie les adaptateurs et injecte dans les cas d'usage. ---
const repo = new ScoreboardSkillRepository();
const worldStore = new ScoreboardWorldStore();
const messenger = new MinecraftMessenger();
const players = new MinecraftPlayerQuery();
const items = new MinecraftItemService();
const clock = new MinecraftClock();

const initPlayer = new InitPlayer(repo);
const awardPoints = new AwardSkillPoints(players, repo, messenger);
const ensureGrimoire = new EnsureGrimoire(items, repo);
const handleDeath = new HandleDeath(repo, messenger);
const resetSkills = new ResetSkills(repo);
const passives = new PassiveApplier(repo);
const combat = new CombatHandler(repo);
const movement = new MovementHandler(repo);
const mining = new MiningHandler(repo);

// Menu principal, boutique et échange se référencent mutuellement (navigation Retour).
const menu: MenuController = new MenuController(
  repo,
  clock,
  items,
  (player) => shop.open(player),
  (player) => exchange.open(player),
);
const shop: ShopController = new ShopController(
  repo,
  worldStore,
  clock,
  items,
  (player) => menu.openMain(player),
);
const exchange: ExchangeController = new ExchangeController(
  repo,
  clock,
  items,
  (player) => menu.openMain(player),
);

/** Un listener ne doit jamais throw non-catché (Bedrock le désinscrirait silencieusement). */
function guard(label: string, fn: () => void): void {
  try {
    fn();
  } catch (err) {
    console.warn(`[MarronTown] ${label}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/** Ouvre le menu principal en gérant les erreurs côté joueur. */
async function openGrimoire(player: Player): Promise<void> {
  try {
    await menu.openMain(player);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[MarronTown] menu: ${msg}`);
    player.sendMessage(`§c[MarronTown] Erreur : ${msg}`);
  }
}

// --- Démarrage ---
system.run(() => {
  world.sendMessage('§6§l✦ Marron Town §r§7chargé — Fabriquez un Grimoire pour commencer !');
});

// --- Events ---
world.afterEvents.playerSpawn.subscribe((event) => {
  guard('init-player', () => initPlayer.run(event.player.id, event.player.level));
  if (!event.initialSpawn) {
    guard('handle-death', () => handleDeath.onRespawn(event.player.id));
    guard('ensure-grimoire', () => ensureGrimoire.onRespawn(event.player.id));
  }
});

// Utilisation d'un objet du mod (Grimoire → menu ; Gomme → reset).
world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source;
  const id = event.itemStack.typeId;
  if (GRIMOIRE_IDS.includes(id)) {
    guard('grimoire-own', () => ensureGrimoire.onUse(player.id));
    guard('grimoire-brand', () => items.brandGrimoire(player.id, GRIMOIRE_IDS));
    system.run(() => {
      void openGrimoire(player);
    });
  } else if (id === ERASER_ID) {
    guard('reset-skills', () => {
      const freed = resetSkills.run(player.id);
      items.removeItem(player.id, ERASER_ID, 1);
      player.playSound('random.totem');
      player.sendMessage(`§d✦ Compétences réinitialisées — §e${freed}§d points rendus, choix déverrouillés.`);
    });
  }
});

// Lait : suspend les boosts du grimoire pendant 10 s (200 ticks).
world.afterEvents.itemCompleteUse.subscribe((event) => {
  if (event.itemStack.typeId !== 'minecraft:milk_bucket') return;
  guard('milk', () => {
    passives.suppressedUntilTick = system.currentTick + 200;
    event.source.sendMessage('§7Lait bu — boosts du grimoire suspendus 10 s.');
  });
});

// Combat : bonus offensifs + réduction hybride.
world.afterEvents.entityHurt.subscribe((event) => {
  guard('combat', () => combat.handle(event));
});

// Minage : Toucher de Soie / Fortune / Vein Miner / Minage Explosif.
world.afterEvents.playerBreakBlock.subscribe((event) => {
  guard('mining', () => mining.handle(event));
});

// --- Boucles ---
// 40 ticks (2 s) : attribution des points + (ré)application des effets passifs.
system.runInterval(() => {
  guard('award-points', () => awardPoints.run());
  guard('passives', () => passives.tick(system.currentTick));
}, 40);

// 2 ticks : perks d'input (double saut, dash).
system.runInterval(() => {
  guard('movement', () => movement.tick());
}, 2);
