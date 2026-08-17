import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../core/services/room.service';
import { SpotifyEmbedPlayer } from '../media/spotify-embed-player/spotify-embed-player';
import { YoutubePlayer } from '../media/youtube-player/youtube-player';
import { AppIcon } from '../shared/icon/icon';
import { Loader } from '../shared/loader/loader';
import { Skeleton } from '../shared/skeleton/skeleton';
import { gameRoute } from '../core/routing/game-route';

@Component({
  selector: 'app-listening',
  imports: [AppIcon, Loader, Skeleton, SpotifyEmbedPlayer, YoutubePlayer],
  templateUrl: './listening.html',
})
export class Listening implements OnInit {
  readonly rooms = inject(RoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly changingMedia = signal(false);
  readonly renderMedia = signal(true);
  readonly startingVoting = signal(false);
  readonly localIndex = signal(0);
  readonly roomCode = signal('');
  private lastMediaKey = '';
  private lastMockStep = '';

  readonly session = computed(() => this.rooms.sessionFor(this.roomCode()));
  readonly isHost = computed(() => Boolean(this.session()?.isHost));
  readonly canPreviewMedia = computed(() => this.isHost() || this.isListeningPlayer());
  readonly isListeningPlayer = computed(() => {
    const room = this.rooms.state();
    const session = this.session();
    const player = room && session ? [room.host, ...room.players].find((item) => item.playerId === session.playerId) : null;
    return Boolean(player?.isPlaying && player.participationStatus === 'ACTIVE');
  });
  readonly playlist = computed(() => {
    const listening = this.rooms.listeningState();
    if (!listening) return [];
    return listening.items?.length ? listening.items : listening.current ? [listening.current] : [];
  });
  readonly currentMedia = computed(() => this.playlist()[this.localIndex()] || null);
  readonly isReady = computed(() => {
    const playerId = this.session()?.playerId;
    return Boolean(playerId && this.rooms.listeningState()?.readyPlayers.some((player) => player.playerId === playerId && player.ready));
  });
  readonly canMarkReady = computed(() => {
    const room = this.rooms.state();
    const session = this.session();
    const player = room && session ? [room.host, ...room.players].find((item) => item.playerId === session.playerId) : null;
    return Boolean(player && !player.isHost && player.isPlaying && player.participationStatus === 'ACTIVE');
  });

  constructor() {
    effect(() => {
      const listening = this.rooms.listeningState();
      const mockStep = this.rooms.activeMockStep();
      if (this.rooms.mockEnabled && listening && mockStep !== this.lastMockStep) {
        this.lastMockStep = mockStep;
        this.localIndex.set(Math.min(listening.index, Math.max(0, this.playlist().length - 1)));
      }
      const media = this.currentMedia();
      const key = media ? `${media.source}:${media.spotifyTrackId || media.youtubeVideoId}:${media.startTime}` : '';
      if (key && key !== this.lastMediaKey) {
        this.lastMediaKey = key;
        this.renderMedia.set(false);
        setTimeout(() => { this.renderMedia.set(true); this.changingMedia.set(false); });
      }
      const room = this.rooms.state();
      if (this.rooms.error()) { this.renderMedia.set(true); this.changingMedia.set(false); this.startingVoting.set(false); }
      if (room?.status === 'VOTING') {
        this.startingVoting.set(false);
        void this.router.navigate(gameRoute(room.roomCode, 'voting'));
      }
    });
  }

  ngOnInit(): void {
    this.roomCode.set((this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase());
    const session = this.rooms.sessionFor(this.roomCode());
    if (session) this.rooms.connect(session); else void this.router.navigate(gameRoute(this.roomCode()));
  }

  nextMedia(): void {
    const total = this.playlist().length;
    if (this.localIndex() >= total - 1) return;
    this.changingMedia.set(true);
    this.renderMedia.set(false);
    this.localIndex.update((index) => index + 1);
  }
  previousMedia(): void {
    if (this.localIndex() <= 0) return;
    this.changingMedia.set(true);
    this.renderMedia.set(false);
    this.localIndex.update((index) => index - 1);
  }
  toggleReady(): void { this.rooms.setListeningReady(!this.isReady()); }
  startVoting(): void { if (!this.rooms.listeningState()?.canStartVoting || this.startingVoting()) return; this.startingVoting.set(true); this.rooms.startVoting(); }
}
