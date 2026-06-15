import { world } from '@minecraft/server';
import { type PlayerQuery, type OnlinePlayer } from '../ports/player-query';
import { findPlayer } from './player-finder';

/** ADAPTATEUR — snapshot des joueurs en ligne. */
export class MinecraftPlayerQuery implements PlayerQuery {
  getOnlinePlayers(): OnlinePlayer[] {
    return world.getAllPlayers().map((p) => ({ id: p.id, name: p.name, level: p.level }));
  }
  getName(playerId: string): string | undefined {
    return findPlayer(playerId)?.name;
  }
}
