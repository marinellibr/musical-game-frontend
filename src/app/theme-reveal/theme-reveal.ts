import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeReaction } from '../core/models/room.models';
import { RoomService } from '../core/services/room.service';
import { Loader } from '../shared/loader/loader';
import { ThemeCard } from '../shared/theme-card/theme-card';
import { Skeleton } from '../shared/skeleton/skeleton';
import { AppIcon } from '../shared/icon/icon';
import { gameRoute } from '../core/routing/game-route';

@Component({
  selector: 'app-theme-reveal',
  imports: [AppIcon, Loader, Skeleton, ThemeCard],
  templateUrl: './theme-reveal.html',
})
export class ThemeReveal implements OnInit {
  readonly rooms = inject(RoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly actionPending = signal(false);
  readonly swappingTheme = signal(false);
  private swappingFromThemeId: string | null = null;
  roomCode = '';

  constructor() {
    effect(() => {
      const state = this.rooms.state();
      const currentThemeId = state?.game?.currentTheme.id;
      if (this.swappingTheme() && this.rooms.error()) {
        this.swappingTheme.set(false);
        this.actionPending.set(false);
        this.swappingFromThemeId = null;
      }
      if (
        this.swappingTheme() &&
        currentThemeId &&
        currentThemeId !== this.swappingFromThemeId
      ) {
        this.swappingTheme.set(false);
        this.actionPending.set(false);
        this.swappingFromThemeId = null;
      }
      if (state?.status === 'CHOOSING') {
        void this.router.navigate(gameRoute(state.roomCode, 'submission'));
      }
    });
  }

  ngOnInit(): void {
    this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase();
    const session = this.rooms.sessionFor(this.roomCode);
    if (!session) {
      void this.router.navigate(gameRoute(this.roomCode));
      return;
    }
    this.rooms.connect(session);
  }

  react(reaction: ThemeReaction): void {
    const next = this.rooms.myThemeReaction() === reaction ? null : reaction;
    this.rooms.reactToTheme(next);
  }

  swapTheme(): void {
    if (this.actionPending()) return;
    this.swappingFromThemeId = this.rooms.state()?.game?.currentTheme.id ?? null;
    this.swappingTheme.set(true);
    this.actionPending.set(true);
    this.rooms.swapTheme();
  }

  startRound(): void {
    if (this.actionPending()) return;
    this.actionPending.set(true);
    this.rooms.startRound();
    setTimeout(() => this.actionPending.set(false), 500);
  }
}
