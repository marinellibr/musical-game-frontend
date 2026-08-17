import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../core/services/room.service';
import { Leaderboard } from '../shared/leaderboard/leaderboard';
import { Loader } from '../shared/loader/loader';
import { gameRoute, gameVersionFromUrl, homeRoute } from '../core/routing/game-route';

@Component({
  selector: 'app-game-result',
  imports: [Leaderboard, Loader],
  templateUrl: './game-result.html',
})
export class GameResult implements OnInit {
  readonly rooms = inject(RoomService); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); roomCode = '';
  readonly restarting = signal(false);
  constructor() {
    effect(() => {
      const state = this.rooms.state();
      if (state?.status === 'LOBBY') {
        this.restarting.set(false);
        void this.router.navigate(gameRoute(state.gameVersion, state.roomCode));
      }
      if (this.rooms.error()) this.restarting.set(false);
    });
  }
  ngOnInit(): void { this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase(); const session = this.rooms.sessionFor(this.roomCode); if (session) this.rooms.connect(session); else void this.router.navigate(gameRoute(gameVersionFromUrl(this.router.url), this.roomCode)); }
  restart(): void { if (this.restarting()) return; this.restarting.set(true); this.rooms.restartGame(); }
  goHome(): void { const version = this.rooms.state()?.gameVersion || gameVersionFromUrl(this.router.url); this.rooms.clearSession(); void this.router.navigate(homeRoute(version)); }
}
