import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeReaction } from '../core/models/room.models';
import { RoomService } from '../core/services/room.service';

@Component({
  selector: 'app-theme-reveal',
  templateUrl: './theme-reveal.html',
})
export class ThemeReveal implements OnInit {
  readonly rooms = inject(RoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly actionPending = signal(false);
  roomCode = '';

  constructor() {
    effect(() => {
      const state = this.rooms.state();
      if (state?.status === 'CHOOSING') {
        void this.router.navigate(['/room', state.roomCode, 'submission']);
      }
    });
  }

  ngOnInit(): void {
    this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase();
    const session = this.rooms.sessionFor(this.roomCode);
    if (!session) {
      void this.router.navigate(['/room', this.roomCode]);
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
    this.actionPending.set(true);
    this.rooms.swapTheme();
    setTimeout(() => this.actionPending.set(false), 500);
  }

  startRound(): void {
    if (this.actionPending()) return;
    this.actionPending.set(true);
    this.rooms.startRound();
    setTimeout(() => this.actionPending.set(false), 500);
  }
}
