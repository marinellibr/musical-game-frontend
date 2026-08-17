import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../core/services/room.service';
import { Loader } from '../shared/loader/loader';
import { AppIcon } from '../shared/icon/icon';

@Component({
  selector: 'app-voting',
  imports: [AppIcon, Loader],
  templateUrl: './voting.html',
})
export class Voting implements OnInit, OnDestroy {
  readonly rooms = inject(RoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly likedGroupId = signal<string | null>(null);
  readonly dislikedGroupId = signal<string | null>(null);
  readonly now = signal(Date.now());
  readonly submitting = signal(false);
  roomCode = '';
  private clockTimer?: ReturnType<typeof setInterval>;
  constructor() {
    effect(() => {
      if (this.rooms.votingView()?.hasVoted) this.submitting.set(false);
      if (this.rooms.error()) this.submitting.set(false);
      if (this.rooms.state()?.status === 'ROUND_RESULTS') void this.router.navigate(['/room', this.roomCode, 'round-result']);
    });
  }
  ngOnInit(): void {
    this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase();
    const session = this.rooms.sessionFor(this.roomCode);
    if (session) this.rooms.connect(session); else void this.router.navigate(['/room', this.roomCode]);
    this.clockTimer = setInterval(() => this.now.set(Date.now()), 250);
  }
  ngOnDestroy(): void { if (this.clockTimer) clearInterval(this.clockTimer); }
  remainingSeconds(): number { return Math.max(0, Math.ceil(((this.rooms.votingView()?.votingEndsAt || 0) - this.now()) / 1000)); }
  formattedTime(): string { const seconds = this.remainingSeconds(); return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
  select(groupId: string, reaction: 'like' | 'dislike'): void {
    if (this.submitting() || this.remainingSeconds() === 0 || this.rooms.votingView()?.hasVoted) return;
    if (reaction === 'like') { this.likedGroupId.set(this.likedGroupId() === groupId ? null : groupId); if (this.dislikedGroupId() === groupId) this.dislikedGroupId.set(null); }
    else { this.dislikedGroupId.set(this.dislikedGroupId() === groupId ? null : groupId); if (this.likedGroupId() === groupId) this.likedGroupId.set(null); }
  }
  submit(): void {
    const likedGroupId = this.likedGroupId(); const dislikedGroupId = this.dislikedGroupId();
    if (likedGroupId && dislikedGroupId && this.remainingSeconds() > 0) { this.submitting.set(true); this.rooms.submitVote({ likedGroupId, dislikedGroupId }); }
  }
}
