import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../core/services/room.service';
import { Loader } from '../shared/loader/loader';
import { ThemeCard } from '../shared/theme-card/theme-card';
import { Skeleton } from '../shared/skeleton/skeleton';
import { gameRoute } from '../core/routing/game-route';

@Component({ selector: 'app-waiting', imports: [Loader, Skeleton, ThemeCard], templateUrl: './waiting.html' })
export class Waiting implements OnInit, OnDestroy {
  readonly rooms = inject(RoomService); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); readonly now = signal(Date.now()); roomCode = ''; private timer?: ReturnType<typeof setInterval>;
  constructor() { effect(() => { const state = this.rooms.state(); const session = this.rooms.sessionFor(state?.roomCode || this.roomCode); const player = state && session ? [state.host, ...state.players].find((item) => item.playerId === session.playerId) : null; if (state && player?.participationStatus === 'ACTIVE') void this.router.navigate(gameRoute(state.roomCode, state.status === 'THEME_REVEAL' ? 'theme' : '')); }); }
  ngOnInit(): void { this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase(); const session = this.rooms.sessionFor(this.roomCode); if (session) this.rooms.connect(session); else void this.router.navigate(gameRoute(this.roomCode)); this.timer = setInterval(() => this.now.set(Date.now()), 1000); }
  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }
  time(): string | null { const end = this.rooms.state()?.game?.roundEndsAt; if (!end || this.rooms.state()?.status !== 'CHOOSING') return null; const value = Math.max(0, Math.ceil((end - this.now()) / 1000)); return `${String(Math.floor(value / 60)).padStart(2,'0')}:${String(value % 60).padStart(2,'0')}`; }
}
