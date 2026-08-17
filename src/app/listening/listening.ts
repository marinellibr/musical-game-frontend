import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../core/services/room.service';
import { SpotifyEmbedPlayer } from '../media/spotify-embed-player/spotify-embed-player';
import { YoutubePlayer } from '../media/youtube-player/youtube-player';
import { Loader } from '../shared/loader/loader';
import { Skeleton } from '../shared/skeleton/skeleton';
import { AppIcon } from '../shared/icon/icon';
import { gameRoute, gameVersionFromUrl } from '../core/routing/game-route';

@Component({
  selector: 'app-listening',
  imports: [AppIcon, SpotifyEmbedPlayer, YoutubePlayer, Loader, Skeleton],
  templateUrl: './listening.html',
})
export class Listening implements OnInit {
  readonly rooms = inject(RoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly changingMedia = signal(false);
  readonly startingVoting = signal(false);
  roomCode = '';
  private lastIndex = -1;

  constructor() {
    effect(() => {
      const state = this.rooms.listeningState();
      if (state && state.index !== this.lastIndex) { this.lastIndex = state.index; this.changingMedia.set(false); }
      const roomState = this.rooms.state();
      if (this.rooms.error()) { this.changingMedia.set(false); this.startingVoting.set(false); }
      if (roomState?.status === 'VOTING') { this.startingVoting.set(false); void this.router.navigate(gameRoute(roomState.gameVersion, roomState.roomCode, 'voting')); }
    });
  }
  ngOnInit(): void {
    this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase();
    const session = this.rooms.sessionFor(this.roomCode);
    if (session) this.rooms.connect(session); else void this.router.navigate(gameRoute(gameVersionFromUrl(this.router.url), this.roomCode));
  }
  move(direction: 'next' | 'previous'): void { this.changingMedia.set(true); this.rooms.moveListening(direction); }
  startVoting(): void { if (this.startingVoting()) return; this.startingVoting.set(true); this.rooms.startVoting(); }
}
