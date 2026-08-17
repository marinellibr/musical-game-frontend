import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { GameSettings, GroupVote, PlayerSession, PublicListeningState, PublicMedia, RoomState, RoundResultView, SubmissionInput, ThemeReaction, ThemeReactionState, VotingView } from '../models/room.models';

export interface RoomSocketError {
  code: string;
  message: string;
}
export type SocketConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private sessionKey = '';
  private readonly roomStateSubject = new BehaviorSubject<RoomState | null>(null);
  private readonly errorSubject = new Subject<RoomSocketError>();
  private readonly removedSubject = new Subject<void>();
  private readonly themeReactionSubject = new BehaviorSubject<ThemeReactionState | null>(null);
  private readonly listeningStateSubject = new BehaviorSubject<PublicListeningState | null>(null);
  private readonly votingStateSubject = new BehaviorSubject<VotingView | null>(null);
  private readonly submissionStatusSubject = new BehaviorSubject<{ submitted: boolean; media: PublicMedia | null }>({ submitted: false, media: null });
  private readonly roundResultSubject = new BehaviorSubject<RoundResultView | null>(null);
  private readonly connectionStateSubject = new BehaviorSubject<SocketConnectionState>('idle');

  readonly roomState$ = this.roomStateSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly removed$ = this.removedSubject.asObservable();
  readonly themeReaction$ = this.themeReactionSubject.asObservable();
  readonly listeningState$ = this.listeningStateSubject.asObservable();
  readonly votingState$ = this.votingStateSubject.asObservable();
  readonly submissionStatus$ = this.submissionStatusSubject.asObservable();
  readonly roundResult$ = this.roundResultSubject.asObservable();
  readonly connectionState$ = this.connectionStateSubject.asObservable();

  connect(session: PlayerSession): void {
    const key = `${session.roomCode}:${session.playerId}`;
    if (this.socket && this.sessionKey === key) {
      if (!this.socket.connected) this.socket.connect();
      return;
    }
    this.disconnect();
    this.connectionStateSubject.next('connecting');
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
    this.socket.on('connect', () => this.connectionStateSubject.next('connected'));
    this.socket.io.on('reconnect_attempt', () => this.connectionStateSubject.next('reconnecting'));
    this.socket.on('disconnect', (reason) => this.connectionStateSubject.next(reason === 'io client disconnect' ? 'idle' : 'disconnected'));
    this.socket.on('room:error', (error: RoomSocketError) => this.errorSubject.next(error));
    this.socket.on('player:removed', () => this.removedSubject.next());
    this.socket.on('theme:reaction', (state: ThemeReactionState) =>
      this.themeReactionSubject.next(state),
    );
    this.socket.on('listening:state', (state: PublicListeningState) => this.listeningStateSubject.next(state));
    this.socket.on('voting:state', (state: VotingView) => this.votingStateSubject.next(state));
    this.socket.on('submission:status', (state: { submitted: boolean; media?: PublicMedia | null }) => this.submissionStatusSubject.next({ submitted: state.submitted, media: state.media || null }));
    this.socket.on('round:result', (state: RoundResultView) => this.roundResultSubject.next(state));
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
  updateSettings(settings: GameSettings): void { this.socket?.emit('game:settings:update', settings); }
  restartGame(): void { this.socket?.emit('game:restart'); }

  reactToTheme(reaction: ThemeReaction | null): void {
    this.socket?.emit('theme:react', { reaction });
  }

  swapTheme(): void {
    this.socket?.emit('theme:swap');
  }

  startRound(): void {
    this.socket?.emit('round:start');
  }

  submitChoice(input: SubmissionInput): void { this.socket?.emit('submission:create', input); }
  startListening(): void { this.socket?.emit('listening:start'); }
  moveListening(direction: 'next' | 'previous'): void { this.socket?.emit(`listening:${direction}`); }
  startVoting(): void { this.socket?.emit('voting:start'); }
  submitVote(vote: GroupVote): void { this.socket?.emit('vote:submit', vote); }
  advanceResult(): void { this.socket?.emit('result:next'); }
  nextRound(): void { this.socket?.emit('round:next'); }

  disconnect(): void {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.sessionKey = '';
    this.roomStateSubject.next(null);
    this.themeReactionSubject.next(null);
    this.listeningStateSubject.next(null);
    this.votingStateSubject.next(null);
    this.submissionStatusSubject.next({ submitted: false, media: null });
    this.roundResultSubject.next(null);
    this.connectionStateSubject.next('idle');
  }
}
