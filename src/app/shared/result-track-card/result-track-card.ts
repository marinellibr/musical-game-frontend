import { booleanAttribute, Component, input, signal } from '@angular/core';
import { RoundRankingEntry } from '../../core/models/room.models';
import { AppIcon } from '../icon/icon';
import { Skeleton } from '../skeleton/skeleton';
import { VoteStats } from '../vote-stats/vote-stats';

@Component({
  selector: 'app-result-track-card',
  imports: [AppIcon, Skeleton, VoteStats],
  template: `
    <article class="result-track-card">
      <div class="result-artwork" [class.youtube-artwork]="entry().media.source === 'YOUTUBE'">
        @if (showPosition()) { <b class="result-position-badge">{{ entry().position }}º</b> }
        @if (entry().media.thumbnail && !imageFailed()) {
          @if (!imageLoaded()) { <app-skeleton variant="media" label="Carregando imagem da mídia" /> }
          <img [class.loaded]="imageLoaded()" [src]="entry().media.thumbnail" alt="" (load)="imageLoaded.set(true)" (error)="imageFailed.set(true)" />
        } @else { <span class="result-artwork-placeholder"><app-icon name="music" size="lg" /></span> }
      </div>

      <div class="result-media-identity">
        <h2 [title]="entry().media.title">{{ entry().media.title }}</h2>
        <p>{{ entry().media.artist || (entry().media.source === 'SPOTIFY' ? 'Artista não informado' : 'Canal não informado') }}</p>
        <div class="result-authors"><span>ESCOLHIDA POR</span><p>@for (author of entry().authors; track author.playerId; let last = $last) { <strong>{{ author.username }}</strong>{{ last ? '' : ' · ' }} }</p></div>
      </div>

      @if (showVotes()) { <span class="result-balance"><small>SALDO</small><strong>{{ entry().voteBalance > 0 ? '+' : '' }}{{ entry().voteBalance }}</strong></span> }
      @if (showVotes()) { <footer class="result-votes"><app-vote-stats [likes]="entry().likes" [dislikes]="entry().dislikes" /></footer> }
    </article>
  `,
})
export class ResultTrackCard {
  readonly entry = input.required<RoundRankingEntry>();
  readonly showPosition = input(false, { transform: booleanAttribute });
  readonly showVotes = input(false, { transform: booleanAttribute });
  readonly imageLoaded = signal(false);
  readonly imageFailed = signal(false);
}
