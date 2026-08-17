import { Injectable } from '@angular/core';
import { PlayerSession } from '../models/room.models';

const STORAGE_KEY = 'musical-game:player-session';

@Injectable({ providedIn: 'root' })
export class PlayerSessionService {
  get(): PlayerSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as PlayerSession;
      if (!session.roomCode || !session.playerId || !session.playerToken) return null;
      return session;
    } catch {
      return null;
    }
  }

  getForRoom(roomCode: string): PlayerSession | null {
    const session = this.get();
    return session?.roomCode === roomCode.toUpperCase() ? session : null;
  }

  save(session: PlayerSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
