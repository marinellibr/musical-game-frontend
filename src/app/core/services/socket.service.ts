import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { PlayerSession, RoomState, ThemeReaction, ThemeReactionState } from '../models/room.models';

export interface RoomSocketError {
  code: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private sessionKey = '';
  private readonly roomStateSubject = new BehaviorSubject<RoomState | null>(null);
  private readonly errorSubject = new Subject<RoomSocketError>();
  private readonly removedSubject = new Subject<void>();
  private readonly themeReactionSubject = new BehaviorSubject<ThemeReactionState | null>(null);

  readonly roomState$ = this.roomStateSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly removed$ = this.removedSubject.asObservable();
  readonly themeReaction$ = this.themeReactionSubject.asObservable();

  connect(session: PlayerSession): void {
    const key = `${session.roomCode}:${session.playerId}`;
    if (this.socket && this.sessionKey === key) {
      if (!this.socket.connected) this.socket.connect();
      return;
    }
    this.disconnect();
    this.sessionKey = key;
    this.socket = io(environment.apiUrl, {
      auth: {
        roomCode: session.roomCode,
        playerId: session.playerId,
        playerToken: session.playerToken,
      },
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5_000,
    });
    this.socket.on('room:state', (state: RoomState) => this.roomStateSubject.next(state));
    this.socket.on('room:error', (error: RoomSocketError) => this.errorSubject.next(error));
    this.socket.on('player:removed', () => this.removedSubject.next());
    this.socket.on('theme:reaction', (state: ThemeReactionState) =>
      this.themeReactionSubject.next(state),
    );
    this.socket.on('connect_error', () =>
      this.errorSubject.next({
        code: 'SERVER_UNAVAILABLE',
        message: 'Não foi possível conectar ao servidor.',
      }),
    );
  }

  removePlayer(playerId: string): void {
    this.socket?.emit('player:remove', { playerId });
  }

  startGame(): void {
    this.socket?.emit('game:start');
  }

  reactToTheme(reaction: ThemeReaction | null): void {
    this.socket?.emit('theme:react', { reaction });
  }

  swapTheme(): void {
    this.socket?.emit('theme:swap');
  }

  startRound(): void {
    this.socket?.emit('round:start');
  }

  disconnect(): void {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.sessionKey = '';
    this.roomStateSubject.next(null);
    this.themeReactionSubject.next(null);
  }
}
