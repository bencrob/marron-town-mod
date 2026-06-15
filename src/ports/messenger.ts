/**
 * PORT — sortie « parler au joueur ». ISP : l'application n'a pas besoin de l'objet
 * `Player` complet, juste de quoi notifier.
 */
export interface Messenger {
  /** Message discret au-dessus de la barre d'action d'un joueur. */
  actionBar(playerId: string, message: string): void;
  /** Message chat à un joueur précis. */
  sendTo(playerId: string, message: string): void;
  /** Message chat à tout le monde. */
  broadcast(message: string): void;
}
