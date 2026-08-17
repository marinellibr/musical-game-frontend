import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PlayerSession, RoomEntryResponse, RoomState } from '../models/room.models';
import { ApiService } from './api.service';
import { PlayerSessionService } from './player-session.service';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly api = inject(ApiService);
  private readonly sessions = inject(PlayerSessionService);
  private readonly sockets = inject(SocketService);

  readonly state = signal<RoomState | null>(null);
  readonly error = signal('');
  readonly requiresRejoin = signal(false);
  readonly wasRemoved = signal(false);

  constructor() {
    this.sockets.roomState$.subscribe((state) => {
      if (state) {
        this.state.set(state);
        this.error.set('');
      }
    });
    this.sockets.error$.subscribe((error) => {
      if (
        error.code === 'PLAYER_SESSION_EXPIRED' ||
        error.code === 'INVALID_PLAYER_SESSION'
      ) {
        this.sessions.clear();
        this.sockets.disconnect();
        this.state.set(null);
        this.requiresRejoin.set(true);
        this.error.set(
          error.code === 'PLAYER_SESSION_EXPIRED'
            ? 'Sua sessão expirou. Entre novamente.'
            : 'Sua sessão não é mais válida. Entre novamente.',
        );
        return;
      }
      if (error.code === 'ROOM_NOT_FOUND') {
        this.sessions.clear();
        this.sockets.disconnect();
        this.state.set(null);
        this.error.set('Essa sala não está mais disponível.');
        return;
      }
      if (error.code === 'FORBIDDEN') {
        this.error.set('Você não tem permissão para remover participantes.');
        return;
      }
      this.error.set('Não foi possível conectar ao servidor. Tente novamente em alguns segundos.');
    });
    this.sockets.removed$.subscribe(() => {
      this.sessions.clear();
      this.sockets.disconnect();
      this.state.set(null);
      this.wasRemoved.set(true);
      this.requiresRejoin.set(false);
      this.error.set('Você foi removido da sala pelo host.');
    });
  }

  async create(username: string, isPlaying: boolean): Promise<PlayerSession> {
    this.error.set('');
    try {
      const response = await firstValueFrom(this.api.createRoom(username, isPlaying));
      return this.storeResponse(response);
    } catch (error) {
      throw new Error(this.messageFor(error, 'Não foi possível criar a sala. Tente novamente.'));
    }
  }

  async join(roomCode: string, username: string): Promise<PlayerSession> {
    this.error.set('');
    try {
      const response = await firstValueFrom(this.api.joinRoom(roomCode, username));
      return this.storeResponse(response);
    } catch (error) {
      throw new Error(this.messageFor(error, 'Não foi possível entrar na sala.'));
    }
  }

  connect(session: PlayerSession): void {
    this.error.set('');
    this.requiresRejoin.set(false);
    this.wasRemoved.set(false);
    this.sockets.connect(session);
  }

  async roomExists(roomCode: string): Promise<boolean> {
    this.error.set('');
    try {
      await firstValueFrom(this.api.getRoom(roomCode));
      return true;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        this.error.set('Essa sala não está mais disponível.');
        return false;
      }
      this.error.set('Não foi possível conectar ao servidor. Tente novamente em alguns segundos.');
      return false;
    }
  }

  sessionFor(roomCode: string): PlayerSession | null {
    return this.sessions.getForRoom(roomCode);
  }

  clearSession(): void {
    this.sockets.disconnect();
    this.sessions.clear();
    this.state.set(null);
    this.requiresRejoin.set(false);
    this.wasRemoved.set(false);
  }

  removePlayer(playerId: string): void {
    this.error.set('');
    this.sockets.removePlayer(playerId);
  }

  startGame(): void {
    this.error.set('');
    this.sockets.startGame();
  }

  private storeResponse(response: RoomEntryResponse): PlayerSession {
    const session: PlayerSession = {
      roomCode: response.roomCode,
      playerId: response.player.playerId,
      playerToken: response.playerToken,
      username: response.player.username,
      isHost: response.player.isHost,
      isPlaying: response.player.isPlaying,
    };
    this.sessions.save(session);
    this.requiresRejoin.set(false);
    this.wasRemoved.set(false);
    this.error.set('');
    return session;
  }

  private messageFor(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 404) return 'Sala não encontrada.';
      if (error.status === 0 || error.status >= 500) {
        return 'Não foi possível conectar ao servidor. Tente novamente em alguns segundos.';
      }
    }
    return fallback;
  }
}
