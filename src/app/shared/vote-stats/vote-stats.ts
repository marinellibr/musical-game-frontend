import { Component, input } from '@angular/core';
import { AppIcon } from '../icon/icon';

@Component({
  selector: 'app-vote-stats',
  imports: [AppIcon],
  template: `<div class="vote-stats" aria-label="Estatísticas dos votos"><span><app-icon name="like" size="sm" /><b>{{ likes() }}</b></span><span><app-icon name="dislike" size="sm" /><b>{{ dislikes() }}</b></span></div>`,
})
export class VoteStats {
  readonly likes = input.required<number>();
  readonly dislikes = input.required<number>();
}
