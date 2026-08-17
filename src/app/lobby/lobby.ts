import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomService } from '../core/services/room.service';

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
  joining = false;
  checking = true;
  joinError = '';
  hasSession = false;
  removingPlayerId: string | null = null;

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
      this.hasSession = true;
      this.checking = false;
      this.rooms.connect(session);
      return;
    }
    await this.rooms.roomExists(this.roomCode);
    this.checking = false;
  }

  ngOnDestroy(): void {
    // The singleton socket stays alive across transient navigation and reconnects automatically.
  }

  async joinRoom(): Promise<void> {
    if (!this.username.trim()) {
      this.joinError = 'Digite seu nome.';
      return;
    }
    this.joining = true;
    this.joinError = '';
    try {
      const session = await this.rooms.join(this.roomCode, this.username.trim());
      this.hasSession = true;
      this.rooms.connect(session);
    } catch (error) {
      this.joinError = (error as Error).message;
    } finally {
      this.joining = false;
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
