import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../core/services/room.service';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.html',
})
export class Voting implements OnInit {
  readonly rooms = inject(RoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly likedGroupId = signal<string | null>(null);
  readonly dislikedGroupId = signal<string | null>(null);
  roomCode = '';
  ngOnInit(): void {
    this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase();
    const session = this.rooms.sessionFor(this.roomCode);
    if (session) this.rooms.connect(session); else void this.router.navigate(['/room', this.roomCode]);
  }
  select(groupId: string, reaction: 'like' | 'dislike'): void {
    if (reaction === 'like') { this.likedGroupId.set(this.likedGroupId() === groupId ? null : groupId); if (this.dislikedGroupId() === groupId) this.dislikedGroupId.set(null); }
    else { this.dislikedGroupId.set(this.dislikedGroupId() === groupId ? null : groupId); if (this.likedGroupId() === groupId) this.likedGroupId.set(null); }
  }
  submit(): void {
    const likedGroupId = this.likedGroupId(); const dislikedGroupId = this.dislikedGroupId();
    if (likedGroupId && dislikedGroupId) this.rooms.submitVote({ likedGroupId, dislikedGroupId });
  }
}
