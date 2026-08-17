import { Component, input } from '@angular/core';
import { LeaderboardEntry } from '../../core/models/room.models';

@Component({
  selector: 'app-leaderboard',
  template: `
    <section class="leaderboard" [class.compact]="compact()">
      <h2>{{ title() }}</h2>
      @if (entries().length) {
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
}
