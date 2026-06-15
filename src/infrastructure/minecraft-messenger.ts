import { world } from '@minecraft/server';
import { type Messenger } from '../ports/messenger';
import { findPlayer } from './player-finder';

/** ADAPTATEUR — messages Minecraft (actionbar / chat). */
export class MinecraftMessenger implements Messenger {
  actionBar(playerId: string, message: string): void {
    findPlayer(playerId)?.onScreenDisplay.setActionBar(message);
  }
  sendTo(playerId: string, message: string): void {
    findPlayer(playerId)?.sendMessage(message);
  }
  broadcast(message: string): void {
    world.sendMessage(message);
  }
}
