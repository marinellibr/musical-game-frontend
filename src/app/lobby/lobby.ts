import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomService } from '../core/services/room.service';

export const MIN_PLAYERS_TO_START = 2;

@Component({
  selector: 'app-lobby',
  imports: [FormsModule, RouterLink],
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
        void this.router.navigate(['/room', state.roomCode, 'theme']);
      }
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
    this.rooms.removePlayer(playerId);
    this.removingPlayerId = null;
  }

  startGame(): void {
    if (this.playingCount() >= MIN_PLAYERS_TO_START) {
      this.rooms.startGame();
    }
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
