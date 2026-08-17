import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomService } from '../core/services/room.service';
import { RoomQr } from '../shared/room-qr/room-qr';
import { Loader } from '../shared/loader/loader';
import { Skeleton } from '../shared/skeleton/skeleton';
import { AppIcon } from '../shared/icon/icon';
import { ChoosingDurationSeconds, TotalRounds } from '../core/models/room.models';

export const MIN_PLAYERS_TO_START = 3;

@Component({
  selector: 'app-lobby',
  imports: [AppIcon, FormsModule, Loader, RouterLink, RoomQr, Skeleton],
  templateUrl: './lobby.html',
})
export class Lobby implements OnInit, OnDestroy {
  readonly rooms = inject(RoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  roomCode = '';
  username = '';
  readonly joining = signal(false);
  readonly checking = signal(true);
  readonly joinError = signal('');
  readonly hasSession = signal(false);
  readonly minPlayersToStart = MIN_PLAYERS_TO_START;
  removingPlayerId: string | null = null;
  readonly removalPendingId = signal<string | null>(null);
  readonly startingGame = signal(false);
  readonly totalRoundOptions: readonly TotalRounds[] = [3, 5, 10];
  readonly choosingDurationOptions: readonly ChoosingDurationSeconds[] = [180, 360, 540];

  constructor() {
    effect(() => {
      const state = this.rooms.state();
      const routeRoomCode = this.route.snapshot.paramMap.get('roomCode')?.toUpperCase();
      const session = this.rooms.sessionFor(routeRoomCode || '');
      const currentPlayer = state && session
        ? [state.host, ...state.players].find((player) => player.playerId === session.playerId)
        : null;
      if (state && currentPlayer?.participationStatus === 'WAITING_NEXT_ROUND') {
        void this.router.navigate(['/room', state.roomCode, 'waiting']);
        return;
      }
      if (state && state.roomCode === routeRoomCode && state.status !== 'LOBBY') {
        this.startingGame.set(false);
        void this.router.navigate(['/room', state.roomCode, 'theme']);
      }
      const pendingRemoval = this.removalPendingId();
      if (pendingRemoval && state && !state.players.some((player) => player.playerId === pendingRemoval)) this.removalPendingId.set(null);
      if (this.rooms.error()) { this.startingGame.set(false); this.removalPendingId.set(null); }
    });
  }

  readonly playingCount = computed(() => {
    const state = this.rooms.state();
    if (!state) return 0;
    return state.players.filter((player) => player.isPlaying).length +
      (state.host.isPlaying ? 1 : 0);
  });

  async ngOnInit(): Promise<void> {
    this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '')
      .replace(/\s+/g, '')
      .toUpperCase();
    const session = this.rooms.sessionFor(this.roomCode);
    if (session) {
      this.hasSession.set(true);
      this.checking.set(false);
      this.rooms.connect(session);
      return;
    }
    await this.rooms.roomExists(this.roomCode);
    this.checking.set(false);
  }

  ngOnDestroy(): void {
    // The singleton socket stays alive across transient navigation and reconnects automatically.
  }

  async joinRoom(): Promise<void> {
    if (!this.username.trim()) {
      this.joinError.set('Digite seu nome.');
      return;
    }
    this.joining.set(true);
    this.joinError.set('');
    try {
      const session = await this.rooms.join(this.roomCode, this.username.trim());
      this.hasSession.set(true);
      this.rooms.connect(session);
    } catch (error) {
      this.joinError.set((error as Error).message);
    } finally {
      this.joining.set(false);
    }
  }

  confirmRemove(playerId: string): void {
    this.removingPlayerId = playerId;
  }

  cancelRemove(): void {
    this.removingPlayerId = null;
  }

  removePlayer(playerId: string): void {
    if (this.removalPendingId()) return;
    this.removalPendingId.set(playerId);
    this.rooms.removePlayer(playerId);
    this.removingPlayerId = null;
  }

  startGame(): void {
    if (this.playingCount() >= MIN_PLAYERS_TO_START) {
      this.startingGame.set(true);
      this.rooms.startGame();
    }
  }

  setTotalRounds(totalRounds: TotalRounds): void {
    const settings = this.rooms.state()?.settings;
    if (settings && settings.totalRounds !== totalRounds) this.rooms.updateSettings({ ...settings, totalRounds });
  }

  setChoosingDuration(choosingDurationSeconds: ChoosingDurationSeconds): void {
    const settings = this.rooms.state()?.settings;
    if (settings && settings.choosingDurationSeconds !== choosingDurationSeconds) this.rooms.updateSettings({ ...settings, choosingDurationSeconds });
  }

  async copyCode(): Promise<void> {
    await navigator.clipboard.writeText(this.roomCode);
  }

  async copyLink(): Promise<void> {
    await navigator.clipboard.writeText(window.location.href);
  }

  goHome(): void {
    this.rooms.clearSession();
    void this.router.navigate(['/']);
  }
}
