import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GameCategory, GameSettings } from '../../../core/models/room.models';
import { ApiService } from '../../../core/services/api.service';
import { RoomService } from '../../../core/services/room.service';
import { Skeleton } from '../../../shared/skeleton/skeleton';
import { CategoryCard } from './category-card';

@Component({
  selector: 'app-category-selection',
  imports: [CategoryCard, Skeleton],
  template: `
    <section class="category-selection" aria-labelledby="category-selection-title">
      <header class="category-selection-header">
        <div><h2 id="category-selection-title">CATEGORIAS DA PARTIDA</h2><p class="muted">Os exemplos ilustram cada categoria e não garantem que o tema aparecerá.</p></div>
        @if (isHost() && categories().length > selected().length) { <button class="small-button" type="button" [disabled]="updating()" (click)="selectAll()">SELECIONAR TODAS</button> }
      </header>
      @if (loading()) {
        <div class="category-grid category-grid-loading">@for (item of [1,2,3,4]; track item) { <app-skeleton variant="results" [lines]="2" label="Carregando categoria" /> }</div>
      } @else if (loadError()) {
        <div class="category-state"><p class="error-message">{{ loadError() }}</p><button class="small-button" type="button" (click)="load()">TENTAR NOVAMENTE</button></div>
      } @else if (categories().length < 2) {
        <div class="category-state"><p class="error-message">Não existem categorias suficientes para configurar a partida.</p></div>
      } @else if (isHost()) {
        <div class="category-grid">@for (category of categories(); track category.id) { <app-category-card [category]="category" [selected]="selected().includes(category.id)" [disabled]="updating()" (toggled)="toggle(category.id)" /> }</div>
      } @else {
        <div class="category-chips">@for (category of selectedCategories(); track category.id) { <span>{{ category.label }}</span> }</div>
      }
      @if (!loading() && !loadError()) { <p class="category-count"><strong>{{ selected().length }} categorias selecionadas</strong><span>Mínimo: 2</span></p> }
      <p class="error-message category-feedback" aria-live="polite">{{ feedback() }}</p>
    </section>
  `,
})
export class CategorySelection implements OnInit {
  private readonly api = inject(ApiService);
  private readonly rooms = inject(RoomService);
  readonly settings = input.required<GameSettings>();
  readonly isHost = input(false);
  readonly categories = signal<GameCategory[]>([]);
  readonly loading = signal(true);
  readonly updating = signal(false);
  readonly loadError = signal('');
  readonly feedback = signal('');
  readonly selected = signal<string[]>([]);

  constructor() {
    effect(() => {
      const authoritative = this.settings().selectedCategories || [];
      this.selected.set([...authoritative]);
      this.updating.set(false);
    });
  }

  ngOnInit(): void { void this.load(); }
  selectedCategories(): GameCategory[] { const selected = new Set(this.selected()); return this.categories().filter((category) => selected.has(category.id)); }
  async load(): Promise<void> {
    this.loading.set(true); this.loadError.set('');
    try { this.categories.set((await firstValueFrom(this.api.getGameCategories())).items); }
    catch { this.loadError.set('Não foi possível carregar as categorias.'); }
    finally { this.loading.set(false); }
  }
  toggle(categoryId: string): void {
    if (!this.isHost() || this.updating()) return;
    const current = this.selected();
    const selected = current.includes(categoryId);
    if (selected && current.length <= 2) { this.feedback.set('Escolha pelo menos 2 categorias.'); return; }
    this.feedback.set('');
    this.update(selected ? current.filter((id) => id !== categoryId) : [...current, categoryId]);
  }
  selectAll(): void { this.feedback.set(''); this.update(this.categories().map((category) => category.id)); }
  private update(selectedCategories: string[]): void {
    this.updating.set(true);
    this.rooms.updateSettings({ ...this.settings(), selectedCategories });
  }
}
