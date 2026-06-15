import { world, type Player } from '@minecraft/server';

/** Résout un Player en ligne par son id (les ports ne manipulent que des id string). */
export function findPlayer(id: string): Player | undefined {
  return world.getAllPlayers().find((p) => p.id === id);
}
