import { Component, input } from '@angular/core';
import { LeaderboardEntry } from '../../core/models/room.models';
import { Skeleton } from '../skeleton/skeleton';
import { AppIcon } from '../icon/icon';

@Component({
  selector: 'app-leaderboard',
  imports: [AppIcon, Skeleton],
  template: `
    <section class="leaderboard" [class.compact]="compact()">
      <h2>{{ title() }}</h2>
      @if (loading()) { <app-skeleton variant="leaderboard" [lines]="placeholderLines()" label="Carregando placar" /> }
      @else if (entries().length) {
        <ol>
          @for (entry of entries(); track entry.playerId) {
            <li class="leaderboard-row">
              <div class="leaderboard-main">
                <b class="leaderboard-position">{{ entry.position }}.</b>
                <strong class="leaderboard-name">{{ entry.username }}</strong>
                <span class="leaderboard-balance"><small>SALDO</small><b>{{ entry.voteBalance > 0 ? '+' : '' }}{{ entry.voteBalance }}</b></span>
              </div>
              <div class="icon-metrics leaderboard-votes"><span><app-icon name="like" size="sm" /> {{ entry.totalLikes }}</span><span><app-icon name="dislike" size="sm" /> {{ entry.totalDislikes }}</span></div>
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
