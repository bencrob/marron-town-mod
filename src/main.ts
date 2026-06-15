import { world, system, type Player } from '@minecraft/server';
import { ScoreboardSkillRepository } from './infrastructure/scoreboard-skill-repository';
import { ScoreboardWorldStore } from './infrastructure/scoreboard-world-store';
import { MinecraftMessenger } from './infrastructure/minecraft-messenger';
import { MinecraftPlayerQuery } from './infrastructure/minecraft-player-query';
import { MinecraftItemService } from './infrastructure/minecraft-item-service';
import { MinecraftClock } from './infrastructure/minecraft-clock';
import { MenuController } from './infrastructure/menu-controller';
import { ShopController } from './infrastructure/shop-controller';
import { PassiveApplier } from './infrastructure/passive-applier';
import { CombatHandler } from './infrastructure/combat-handler';
import { MovementHandler } from './infrastructure/movement-handler';
import { MiningHandler } from './infrastructure/mining-handler';
import { InitPlayer } from './application/init-player';
import { AwardSkillPoints } from './application/award-skill-points';
import { EnsureGrimoire, GRIMOIRE_ID } from './application/ensure-grimoire';
import { HandleDeath } from './application/handle-death';

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
const passives = new PassiveApplier(repo);
const combat = new CombatHandler(repo);
const movement = new MovementHandler(repo);
const mining = new MiningHandler(repo);

// Menu principal et boutique se référencent mutuellement (navigation Retour).
const menu: MenuController = new MenuController(repo, clock, (player) => shop.open(player));
const shop: ShopController = new ShopController(
  repo,
  worldStore,
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

// Utilisation du Grimoire → ouverture différée du menu (évite l'état « UserBusy » de l'UI).
world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== GRIMOIRE_ID) return;
  const player = event.source;
  guard('grimoire-own', () => ensureGrimoire.onUse(player.id));
  system.run(() => {
    void openGrimoire(player);
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
  guard('passives', () => passives.tick());
}, 40);

// 2 ticks : perks d'input (double saut, dash, second souffle).
system.runInterval(() => {
  guard('movement', () => movement.tick());
}, 2);
