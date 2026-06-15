import { world, type ScoreboardObjective } from '@minecraft/server';

/**
 * Helpers scoreboard. Les objectifs sont créés à la demande (idempotent).
 * Participants : chaîne (id joueur pour le per-joueur, "world" pour les valeurs monde).
 */
export function objective(id: string): ScoreboardObjective {
  return world.scoreboard.getObjective(id) ?? world.scoreboard.addObjective(id, id);
}

export function readScore(id: string, participant: string): number | undefined {
  try {
    return objective(id).getScore(participant);
  } catch {
    return undefined;
  }
}

export function writeScore(id: string, participant: string, value: number): void {
  objective(id).setScore(participant, value);
}
