import { Component, computed, input } from '@angular/core';
import { PublicFinalAnalysis } from '../../core/models/room.models';

interface HighlightView { label: string; names: string; copy: string; detail?: string }

@Component({
  selector: 'app-final-analysis',
  template: `
    @if (highlights().length) {
      <section class="final-analysis" aria-labelledby="analysis-title">
        <h2 id="analysis-title">DESTAQUES DA PARTIDA</h2>
        <div class="analysis-highlight-list">
          @for (highlight of highlights(); track highlight.label) {
            <article class="analysis-highlight-card">
              <span>{{ highlight.label }}</span>
              <strong>{{ highlight.names }}</strong>
              <p>{{ highlight.copy }}</p>
              @if (highlight.detail) { <small>{{ highlight.detail }}</small> }
            </article>
          }
        </div>
      </section>
    }
  `,
})
export class FinalAnalysis {
  readonly analysis = input.required<PublicFinalAnalysis>();
  readonly highlights = computed<HighlightView[]>(() => {
    const highlights = this.analysis().highlights;
    const result: HighlightView[] = [];
    const names = (players: Array<{ username: string }>) => players.map((player) => player.username).join(' + ');
    const affinity = highlights.strongestAffinity[0];
    if (affinity) result.push({ label: 'MAIOR AFINIDADE', names: names(affinity.players), copy: 'Vocês concordaram mais do que o resto da mesa.' });
    const controversial = highlights.mostControversial;
    if (controversial.length) result.push({ label: 'MAIS CONTROVERSO', names: names(controversial), copy: 'Suas escolhas dividiram opiniões.' });
    const same = highlights.mostSameChoices[0];
    if (same?.sameChoices) result.push({ label: 'MESMA FREQUÊNCIA', names: names(same.players), copy: 'Vocês escolheram a mesma mídia mais vezes.', detail: `${same.sameChoices} ${same.sameChoices === 1 ? 'escolha igual' : 'escolhas iguais'}` });
    const liked = highlights.mostLiked;
    if (liked.length) result.push({ label: 'MAIS CURTIDO', names: names(liked), copy: 'As escolhas que mais receberam curtidas.' });
    const rivalry = highlights.strongestRivalry[0];
    if (rivalry) result.push({ label: 'MAIOR DISCORDÂNCIA', names: names(rivalry.players), copy: 'Vocês discordaram mais nas escolhas desta partida.' });
    return result;
  });
}
