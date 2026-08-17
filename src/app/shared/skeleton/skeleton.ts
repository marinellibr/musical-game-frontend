import { Component, computed, input } from '@angular/core';

export type SkeletonVariant = 'track' | 'media' | 'qr' | 'theme' | 'leaderboard' | 'players' | 'results';

@Component({
  selector: 'app-skeleton',
  template: `
    <div class="skeleton skeleton-{{ variant() }}" role="status" [attr.aria-label]="label()">
      @switch (variant()) {
        @case ('track') { <i class="skeleton-square"></i><span><i></i><i></i><i></i></span><i class="skeleton-button"></i> }
        @case ('media') { <i class="skeleton-media-block"></i> }
        @case ('qr') { <i class="skeleton-qr-block"></i> }
        @case ('theme') { <span><i></i><i></i><i></i></span> }
        @default { @for (line of lineItems(); track $index) { <span class="skeleton-row"><i></i><i></i></span> } }
      }
      <span class="sr-only">{{ label() }}</span>
    </div>
  `,
})
export class Skeleton {
  readonly variant = input<SkeletonVariant>('results');
  readonly lines = input(3);
  readonly label = input('Carregando conteúdo');
  readonly lineItems = computed(() => Array.from({ length: this.lines() }));
}
