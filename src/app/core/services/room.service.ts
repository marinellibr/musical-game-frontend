import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GameSettings, GameTheme, GameVersion, GroupVote, LeaderboardEntry, PlayerSession, PublicListeningState, PublicMedia, PublicPlayer, RoomEntryResponse, RoomState, RoundResultView, SpotifyTrack, SubmissionInput, ThemeReaction, VotingView, YouTubeMetadata } from '../models/room.models';
import { ApiService } from './api.service';
import { PlayerSessionService } from './player-session.service';
import { SocketConnectionState, SocketService } from './socket.service';
import { environment } from '../../../environments/environment';

export type DevMockStep = 'LOBBY' | 'THEME_REVEAL' | 'CHOOSING' | 'LISTENING' | 'VOTING' | 'ROUND_RESULTS' | 'GAME_RESULTS';
interface DevMockData {
  roomCode: string;
  settings: GameSettings;
  host: PublicPlayer;
  players: PublicPlayer[];
  theme: GameTheme;
  spotifyTracks: SpotifyTrack[];
  youtube: YouTubeMetadata;
  media: PublicMedia[];
  leaderboard: LeaderboardEntry[];
  themes?: GameTheme[];
}

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
  readonly mockRole: 'host' | 'host-only' | 'player' | null = environment.mockRole;
  readonly mockEnabled = this.mockRole !== null;
  readonly mockReady = signal(false);
  readonly mockGameVersion = signal<GameVersion>('v1');
  private mockData: DevMockData | null = null;

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
      if (error.code === 'MIN_CATEGORIES_REQUIRED') { this.error.set('Escolha pelo menos 2 categorias.'); return; }
      if (error.code === 'INVALID_CATEGORY') { this.error.set('Uma das categorias selecionadas não está mais disponível.'); return; }
      if (error.code === 'NOT_ENOUGH_THEMES') { this.error.set('Não há temas suficientes para essa configuração.'); return; }
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

  async create(username: string, isPlaying: boolean, gameVersion: GameVersion = 'v1'): Promise<PlayerSession> {
    this.error.set('');
    try {
      const response = await firstValueFrom(this.api.createRoom(username, isPlaying, gameVersion));
      return this.storeResponse(response);
    } catch (error) {
      throw new Error(this.messageFor(error, 'Não foi possível criar a sala. Tente novamente.'));
    }
  }

  async join(roomCode: string, username: string, gameVersion: GameVersion = 'v1'): Promise<PlayerSession> {
    this.error.set('');
    try {
      const response = await firstValueFrom(this.api.joinRoom(roomCode, username));
      return this.storeResponse({ ...response, gameVersion: response.gameVersion || gameVersion });
    } catch (error) {
      throw new Error(this.messageFor(error, 'Não foi possível entrar na sala.'));
    }
  }

  connect(session: PlayerSession): void {
    if (this.mockEnabled) { void this.initializeMock(); return; }
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
    if (this.mockEnabled) {
      const isPlayer = this.mockRole === 'player';
      return { roomCode: (roomCode || this.mockData?.roomCode || 'MOCK').toUpperCase(), playerId: isPlayer ? 'mock-player-1' : 'mock-host', playerToken: 'local-mock-token', username: isPlayer ? 'Carol' : 'Luiz (Host)', isHost: !isPlayer, isPlaying: this.mockRole !== 'host-only', gameVersion: this.mockGameVersion() };
    }
    return this.sessions.getForRoom(roomCode);
  }

  async initializeMock(): Promise<void> {
    if (!this.mockEnabled || this.mockReady()) return;
    const response = await fetch('/mock.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Não foi possível carregar mock.json.');
    this.mockData = await response.json() as DevMockData;
    this.activateMockStep('LOBBY');
    this.connectionState.set('connected');
    this.mockReady.set(true);
  }

  activateMockStep(step: DevMockStep): void {
    const data = this.mockData;
    if (!data) return;
    const host = { ...data.host, isPlaying: this.mockRole !== 'host-only' };
    const leaderboard = this.mockRole === 'host-only' ? data.leaderboard.filter((entry) => entry.playerId !== host.playerId) : data.leaderboard;
    const game = step === 'LOBBY' ? null : {
      round: step === 'GAME_RESULTS' ? data.settings.totalRounds : 2,
      totalRounds: data.settings.totalRounds,
      phase: (step === 'THEME_REVEAL' ? 'THEME_SELECTION' : step === 'GAME_RESULTS' ? 'ROUND_RESULTS' : step) as 'THEME_SELECTION' | 'CHOOSING' | 'LISTENING' | 'VOTING' | 'ROUND_RESULTS',
      currentTheme: data.theme,
      likes: 3,
      dislikes: 1,
      reactedPlayers: 4,
      playersCount: host.isPlaying ? 4 : 3,
      roundStartedAt: step === 'CHOOSING' ? Date.now() : null,
      roundEndsAt: step === 'CHOOSING' ? Date.now() + data.settings.choosingDurationSeconds * 1000 : null,
      submittedCount: 2,
      waitingNextRoundCount: 0,
      leaderboard,
    };
    this.state.set({ roomCode: data.roomCode, status: step, gameVersion: this.mockGameVersion(), host, players: data.players.map((player) => ({ ...player })), settings: { ...data.settings }, game });
    this.hasSubmitted.set(false);
    this.submittedMedia.set(null);
    this.listeningState.set(step === 'LISTENING' ? { theme: data.theme, index: 0, total: data.media.length, current: data.media[0], finished: false, votingEnabled: true } : null);
    this.votingView.set(step === 'VOTING' ? { ownSubmission: this.mockRole === 'host-only' ? null : data.media[0], groups: data.media.slice(1).map((media, index) => ({ groupId: `mock-group-${index + 1}`, media, canVote: this.mockRole !== 'host-only' })), hasVoted: false, canVote: this.mockRole !== 'host-only', votedPlayers: [], eligiblePlayersCount: host.isPlaying ? 4 : 3, votingStartedAt: Date.now(), votingEndsAt: Date.now() + 60_000 } : null);
    this.roundResult.set(step === 'ROUND_RESULTS' ? this.mockRoundResult(data, leaderboard) : null);
    this.error.set('');
  }

  mockTracks(): SpotifyTrack[] { return this.mockData?.spotifyTracks || []; }
  mockYouTube(): YouTubeMetadata | null { return this.mockData?.youtube || null; }
  setMockVersion(version: GameVersion): void { if (!this.mockReady()) this.mockGameVersion.set(version); }

  private mockRoundResult(data: DevMockData, leaderboard: LeaderboardEntry[]): RoundResultView {
    return { round: 2, totalRounds: data.settings.totalRounds, theme: data.theme, revealStage: 'RANKING', leaderboard, isLastRound: false, ranking: data.media.map((media, index) => ({ groupId: `mock-group-${index + 1}`, media, authors: [{ playerId: data.players[index]?.playerId || 'mock-player', username: data.players[index]?.username || 'Jogador' }], likes: 6 - index, dislikes: index, voteBalance: 6 - index * 2, position: index + 1 })) };
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
    if (this.mockEnabled) { const state = this.state(); if (state) this.state.set({ ...state, players: state.players.filter((player) => player.playerId !== playerId) }); return; }
    this.sockets.removePlayer(playerId);
  }

  startGame(): void {
    this.error.set('');
    if (this.mockEnabled) { this.activateMockStep('THEME_REVEAL'); return; }
    this.sockets.startGame();
  }
  updateSettings(settings: GameSettings): void { this.error.set(''); if (this.mockEnabled) { if (this.mockData) this.mockData.settings = { ...settings }; const current = this.state(); if (current) this.state.set({ ...current, settings: { ...settings } }); return; } this.sockets.updateSettings(settings); }
  restartGame(): void { this.error.set(''); if (this.mockEnabled) { this.activateMockStep('LOBBY'); return; } this.sockets.restartGame(); }

  reactToTheme(reaction: ThemeReaction | null): void {
    if (this.mockEnabled) { this.myThemeReaction.set(reaction); return; }
    this.sockets.reactToTheme(reaction);
  }

  swapTheme(): void {
    this.error.set('');
    if (this.mockEnabled) { const state = this.state(); if (state?.game) this.state.set({ ...state, game: { ...state.game, currentTheme: { ...state.game.currentTheme, id: `${state.game.currentTheme.id}-alternativo`, title: 'Música que todo mundo sabe cantar' }, likes: 0, dislikes: 0, reactedPlayers: 0 } }); return; }
    this.sockets.swapTheme();
  }

  startRound(): void {
    this.error.set('');
    if (this.mockEnabled) { this.activateMockStep('CHOOSING'); return; }
    this.sockets.startRound();
  }

  submitChoice(input: SubmissionInput): void { this.error.set(''); if (this.mockEnabled) { this.hasSubmitted.set(true); this.submittedMedia.set({ ...input, startTime: input.startTime || 0, externalUrl: '#' }); return; } this.sockets.submitChoice(input); }
  startListening(): void { this.error.set(''); if (this.mockEnabled) { this.activateMockStep('LISTENING'); return; } this.sockets.startListening(); }
  moveListening(direction: 'next' | 'previous'): void { this.error.set(''); if (this.mockEnabled) { const data = this.mockData; const current = this.listeningState(); if (data && current) { const index = direction === 'next' ? Math.min(current.index + 1, current.total) : Math.max(current.index - 1, 0); this.listeningState.set({ ...current, index, current: data.media[index] || null, finished: index >= current.total }); } return; } this.sockets.moveListening(direction); }
  startVoting(): void { this.error.set(''); if (this.mockEnabled) { this.activateMockStep('VOTING'); return; } this.sockets.startVoting(); }
  submitVote(vote: GroupVote): void { this.error.set(''); if (this.mockEnabled) { const view = this.votingView(); if (view) this.votingView.set({ ...view, hasVoted: true }); return; } this.sockets.submitVote(vote); }
  advanceResult(): void { this.error.set(''); if (this.mockEnabled) { const result = this.roundResult(); if (result) this.roundResult.set({ ...result, revealStage: result.revealStage === 'AUTHORS' ? 'VOTES' : 'RANKING' }); return; } this.sockets.advanceResult(); }
  nextRound(): void { this.error.set(''); if (this.mockEnabled) { this.activateMockStep('THEME_REVEAL'); return; } this.sockets.nextRound(); }

  private storeResponse(response: RoomEntryResponse): PlayerSession {
    const session: PlayerSession = {
      roomCode: response.roomCode,
      playerId: response.player.playerId,
      playerToken: response.playerToken,
      username: response.player.username,
      isHost: response.player.isHost,
      isPlaying: response.player.isPlaying,
      gameVersion: response.gameVersion || 'v1',
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
