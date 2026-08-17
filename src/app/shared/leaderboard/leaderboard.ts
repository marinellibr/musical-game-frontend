import { Component, input } from '@angular/core';
import { LeaderboardEntry } from '../../core/models/room.models';
import { Skeleton } from '../skeleton/skeleton';

@Component({
  selector: 'app-leaderboard',
  imports: [Skeleton],
  template: `
    <section class="leaderboard" [class.compact]="compact()">
      <h2>{{ title() }}</h2>
      @if (loading()) { <app-skeleton variant="leaderboard" [lines]="placeholderLines()" label="Carregando placar" /> }
      @else if (entries().length) {
        <ol>
          @for (entry of entries(); track entry.playerId) {
            <li>
              <span><b>{{ entry.position }}.</b> {{ entry.username }}</span>
              <strong>{{ entry.voteBalance > 0 ? '+' : '' }}{{ entry.voteBalance }}</strong>
              <small>👍 {{ entry.totalLikes }} · 👎 {{ entry.totalDislikes }}</small>
            </li>
          }
        </ol>
      } @else { <p>Ainda não há votos consolidados.</p> }
    </section>
  `,
})
export class Leaderboard {
  readonly entries = input.required<LeaderboardEntry[]>();
  readonly title = input('PLACAR');
  readonly compact = input(false);
  readonly loading = input(false);
  readonly placeholderLines = input(4);
}
