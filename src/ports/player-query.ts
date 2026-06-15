/**
 * PORT — lecture d'état des joueurs en ligne (snapshot). Les capacités combat/mouvement
 * (santé, offhand, accroupi…) seront ajoutées dans les phases ultérieures.
 */
export interface OnlinePlayer {
  readonly id: string;
  readonly name: string;
  /** Niveau d'XP Minecraft courant. */
  readonly level: number;
}

export interface PlayerQuery {
  getOnlinePlayers(): OnlinePlayer[];
  getName(playerId: string): string | undefined;
}
