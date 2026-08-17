import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../core/services/room.service';
import { Leaderboard } from '../shared/leaderboard/leaderboard';
import { Loader } from '../shared/loader/loader';
import { gameRoute, homeRoute } from '../core/routing/game-route';
import { FinalAnalysis } from '../shared/final-analysis/final-analysis';
import { Skeleton } from '../shared/skeleton/skeleton';

@Component({
  selector: 'app-game-result',
  imports: [FinalAnalysis, Leaderboard, Loader, Skeleton],
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
        void this.router.navigate(gameRoute(state.roomCode));
      }
      if (this.rooms.error()) this.restarting.set(false);
      if (state?.status === 'GAME_RESULTS' && state.sessionId && !this.rooms.finishedResult() && !this.rooms.resultLoading() && !this.rooms.resultError()) void this.rooms.loadFinishedResult(state.sessionId);
    });
  }
  ngOnInit(): void { this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase(); const session = this.rooms.sessionFor(this.roomCode); if (session) this.rooms.connect(session); else void this.router.navigate(gameRoute(this.roomCode)); }
  restart(): void { if (this.restarting()) return; this.restarting.set(true); this.rooms.restartGame(); }
  retryResult(): void { const sessionId = this.rooms.state()?.sessionId; if (sessionId) void this.rooms.loadFinishedResult(sessionId); }
  goHome(): void { this.rooms.clearSession(); void this.router.navigate(homeRoute()); }
}
