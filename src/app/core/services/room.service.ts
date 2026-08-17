import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GameSettings, GroupVote, PlayerSession, PublicListeningState, PublicMedia, RoomEntryResponse, RoomState, RoundResultView, SubmissionInput, ThemeReaction, VotingView } from '../models/room.models';
import { ApiService } from './api.service';
import { PlayerSessionService } from './player-session.service';
import { SocketConnectionState, SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly api = inject(ApiService);
  private readonly sessions = inject(PlayerSessionService);
  private readonly sockets = inject(SocketService);

  readonly state = signal<RoomState | null>(null);
  readonly error = signal('');
  readonly requiresRejoin = signal(false);
  readonly wasRemoved = signal(false);
  readonly myThemeReaction = signal<ThemeReaction | null>(null);
  readonly listeningState = signal<PublicListeningState | null>(null);
  readonly votingView = signal<VotingView | null>(null);
  readonly hasSubmitted = signal(false);
  readonly submittedMedia = signal<PublicMedia | null>(null);
  readonly roundResult = signal<RoundResultView | null>(null);
  readonly connectionState = signal<SocketConnectionState>('idle');
  private submissionRoundKey = '';

  constructor() {
    this.sockets.roomState$.subscribe((state) => {
      if (state) {
        const nextRoundKey = `${state.roomCode}:${state.game?.round ?? 'lobby'}`;
        if (nextRoundKey !== this.submissionRoundKey) {
          this.submissionRoundKey = nextRoundKey;
          this.hasSubmitted.set(false);
          this.submittedMedia.set(null);
        }
        if (state.status === 'LOBBY') {
          this.myThemeReaction.set(null);
          this.listeningState.set(null);
          this.votingView.set(null);
          this.roundResult.set(null);
        }
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
        this.error.set('Você não tem permissão para realizar esta ação.');
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
    this.sockets.themeReaction$.subscribe((state) => {
      if (state) this.myThemeReaction.set(state.reaction);
    });
    this.sockets.listeningState$.subscribe((state) => this.listeningState.set(state));
    this.sockets.votingState$.subscribe((state) => this.votingView.set(state));
    this.sockets.submissionStatus$.subscribe((status) => { this.hasSubmitted.set(status.submitted); this.submittedMedia.set(status.media); });
    this.sockets.roundResult$.subscribe((result) => this.roundResult.set(result));
    this.sockets.connectionState$.subscribe((state) => this.connectionState.set(state));
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
    this.submissionRoundKey = '';
    this.hasSubmitted.set(false);
    this.submittedMedia.set(null);
  }

  resetSubmissionState(): void { this.hasSubmitted.set(false); this.submittedMedia.set(null); }

  removePlayer(playerId: string): void {
    this.error.set('');
    this.sockets.removePlayer(playerId);
  }

  startGame(): void {
    this.error.set('');
    this.sockets.startGame();
  }
  updateSettings(settings: GameSettings): void { this.error.set(''); this.sockets.updateSettings(settings); }
  restartGame(): void { this.error.set(''); this.sockets.restartGame(); }

  reactToTheme(reaction: ThemeReaction | null): void {
    this.sockets.reactToTheme(reaction);
  }

  swapTheme(): void {
    this.error.set('');
    this.sockets.swapTheme();
  }

  startRound(): void {
    this.error.set('');
    this.sockets.startRound();
  }

  submitChoice(input: SubmissionInput): void { this.error.set(''); this.sockets.submitChoice(input); }
  startListening(): void { this.error.set(''); this.sockets.startListening(); }
  moveListening(direction: 'next' | 'previous'): void { this.error.set(''); this.sockets.moveListening(direction); }
  startVoting(): void { this.error.set(''); this.sockets.startVoting(); }
  submitVote(vote: GroupVote): void { this.error.set(''); this.sockets.submitVote(vote); }
  advanceResult(): void { this.error.set(''); this.sockets.advanceResult(); }
  nextRound(): void { this.error.set(''); this.sockets.nextRound(); }

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
