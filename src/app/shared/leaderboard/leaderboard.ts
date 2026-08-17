import { Component, input } from '@angular/core';
import { LeaderboardEntry } from '../../core/models/room.models';
import { Skeleton } from '../skeleton/skeleton';
import { VoteStats } from '../vote-stats/vote-stats';
import { AnimatedList } from '../animated-list/animated-list';

@Component({
  selector: 'app-leaderboard',
  imports: [AnimatedList, Skeleton, VoteStats],
  template: `
    <section class="leaderboard" [class.compact]="compact()">
      <h2>{{ title() }}</h2>
      @if (loading()) { <app-skeleton variant="leaderboard" [lines]="placeholderLines()" label="Carregando placar" /> }
      @else if (entries().length) {
        <ol appAnimatedList>
          @for (entry of entries(); track entry.playerId) {
            <li class="leaderboard-row" [attr.data-animation-key]="entry.playerId">
              <div class="leaderboard-main">
                <b class="leaderboard-position">{{ entry.position }}.</b>
                <strong class="leaderboard-name">{{ entry.username }}</strong>
                <span class="leaderboard-balance"><small>SALDO</small><b>{{ entry.voteBalance > 0 ? '+' : '' }}{{ entry.voteBalance }}</b></span>
              </div>
              <div class="leaderboard-votes"><app-vote-stats [likes]="entry.totalLikes" [dislikes]="entry.totalDislikes" /></div>
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
