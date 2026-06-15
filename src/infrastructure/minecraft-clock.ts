import { system } from '@minecraft/server';
import { type Clock } from '../ports/clock';

/** ADAPTATEUR — horloge réelle Minecraft. */
export class MinecraftClock implements Clock {
  currentTick(): number {
    return system.currentTick;
  }
  nowMs(): number {
    return Date.now();
  }
}
