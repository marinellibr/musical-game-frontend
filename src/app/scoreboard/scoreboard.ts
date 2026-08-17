import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../core/services/room.service';
import { Leaderboard } from '../shared/leaderboard/leaderboard';

@Component({
  selector: 'app-scoreboard',
  imports: [Leaderboard],
  templateUrl: './scoreboard.html',
})
export class Scoreboard implements OnInit {
  readonly rooms = inject(RoomService); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); roomCode = '';
  ngOnInit(): void { this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase(); const session = this.rooms.sessionFor(this.roomCode); if (session) this.rooms.connect(session); else void this.router.navigate(['/room', this.roomCode]); }
}
