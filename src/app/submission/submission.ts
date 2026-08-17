import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MediaSource } from '../core/models/room.models';
import { RoomService } from '../core/services/room.service';

@Component({
  selector: 'app-submission',
  imports: [FormsModule],
  templateUrl: './submission.html',
})
export class Submission implements OnInit {
  readonly rooms = inject(RoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  roomCode = '';
  source: MediaSource = 'SPOTIFY';
  title = '';
  artist = '';
  mediaId = '';
  startTime: number | null = null;

  constructor() {
    effect(() => {
      const state = this.rooms.state();
      if (state?.status === 'LISTENING') void this.router.navigate(['/room', state.roomCode, 'listening']);
    });
  }

  ngOnInit(): void {
    this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase();
    const session = this.rooms.sessionFor(this.roomCode);
    const themeType = this.rooms.state()?.game?.currentTheme.type;
    if (themeType === 'MOMENT' || themeType === 'YT_NOTIME') this.source = 'YOUTUBE';
    if (session) this.rooms.connect(session);
    else void this.router.navigate(['/room', this.roomCode]);
  }

  submit(): void {
    this.rooms.submitChoice({
      source: this.source,
      title: this.title.trim(),
      ...(this.artist.trim() ? { artist: this.artist.trim() } : {}),
      ...(this.source === 'SPOTIFY' ? { spotifyTrackId: this.mediaId.trim() } : { youtubeVideoId: this.mediaId.trim() }),
      ...(this.startTime !== null ? { startTime: this.startTime } : {}),
    });
  }
}
