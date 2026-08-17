import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { GameCategory } from '../../../core/models/room.models';
import { AppIcon } from '../../../shared/icon/icon';
import { themeCategoryColor } from '../../../shared/theme-card/theme-card';

@Component({
  selector: 'app-category-card',
  imports: [AppIcon],
  template: `
    <button class="category-card" type="button" role="checkbox" [style.--category-accent]="accent()" [attr.aria-checked]="selected()" [class.selected]="selected()" [disabled]="disabled()" (click)="toggled.emit()">
      <span class="category-card-heading"><strong>{{ category().label }}</strong>@if (selected()) { <app-icon name="check" size="sm" ariaLabel="Selecionada" /> }</span>
      <span class="category-description">{{ category().description }}</span>
      @if (category().examples.length) {
        <span class="category-examples"><small>EXEMPLOS</small>@for (example of category().examples; track example.id) { <span>• {{ example.title }}</span> }</span>
      }
    </button>
  `,
})
export class CategoryCard {
  readonly category = input.required<GameCategory>();
  readonly selected = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly toggled = output<void>();
  readonly accent = computed(() => themeCategoryColor(this.category().id));
}
