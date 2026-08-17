import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../core/services/room.service';
import { Leaderboard } from '../shared/leaderboard/leaderboard';
import { Loader } from '../shared/loader/loader';
import { ThemeCard } from '../shared/theme-card/theme-card';
import { Skeleton } from '../shared/skeleton/skeleton';
import { AppIcon } from '../shared/icon/icon';
import { gameRoute, gameVersionFromUrl } from '../core/routing/game-route';

@Component({
  selector: 'app-round-result',
  imports: [AppIcon, Leaderboard, Loader, Skeleton, ThemeCard],
  templateUrl: './round-result.html',
})
export class RoundResult implements OnInit {
  readonly rooms = inject(RoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly loading = signal(false);
  roomCode = '';
  private lastStage = '';
  constructor() {
    effect(() => {
      const result = this.rooms.roundResult();
      if (result?.revealStage !== this.lastStage) { this.lastStage = result?.revealStage || ''; this.loading.set(false); }
      if (this.rooms.error()) this.loading.set(false);
      const status = this.rooms.state()?.status;
      const version = this.rooms.state()?.gameVersion || gameVersionFromUrl(this.router.url);
      if (status === 'THEME_REVEAL') void this.router.navigate(gameRoute(version, this.roomCode, 'theme'));
      if (status === 'GAME_RESULTS') void this.router.navigate(gameRoute(version, this.roomCode, 'game-result'));
    });
  }
  ngOnInit(): void {
    this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase();
    const session = this.rooms.sessionFor(this.roomCode);
    if (session) this.rooms.connect(session); else void this.router.navigate(gameRoute(gameVersionFromUrl(this.router.url), this.roomCode));
  }
  advance(): void { this.loading.set(true); this.rooms.advanceResult(); }
  nextRound(): void { this.loading.set(true); this.rooms.nextRound(); }
}
