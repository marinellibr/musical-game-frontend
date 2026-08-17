import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../core/services/room.service';
import { SpotifyEmbedPlayer } from '../media/spotify-embed-player/spotify-embed-player';
import { YoutubePlayer } from '../media/youtube-player/youtube-player';
import { Loader } from '../shared/loader/loader';

@Component({
  selector: 'app-listening',
  imports: [SpotifyEmbedPlayer, YoutubePlayer, Loader],
  templateUrl: './listening.html',
})
export class Listening implements OnInit {
  readonly rooms = inject(RoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly changingMedia = signal(false);
  roomCode = '';
  private lastIndex = -1;

  constructor() {
    effect(() => {
      const state = this.rooms.listeningState();
      if (state && state.index !== this.lastIndex) { this.lastIndex = state.index; this.changingMedia.set(false); }
      const roomState = this.rooms.state();
      if (roomState?.status === 'VOTING') void this.router.navigate(['/room', roomState.roomCode, 'voting']);
    });
  }
  ngOnInit(): void {
    this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase();
    const session = this.rooms.sessionFor(this.roomCode);
    if (session) this.rooms.connect(session); else void this.router.navigate(['/room', this.roomCode]);
  }
  move(direction: 'next' | 'previous'): void { this.changingMedia.set(true); this.rooms.moveListening(direction); }
}
