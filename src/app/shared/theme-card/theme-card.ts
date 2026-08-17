import { booleanAttribute, Component, computed, input } from '@angular/core';
import { GameTheme } from '../../core/models/room.models';

export type ThemeCategory = 'INSTRUMENTS' | 'VOCALS' | 'EMOTIONS' | 'SITUATIONS' | 'CHAOS' | 'CINEMA' | 'HOT_TAKE' | 'NOSTALGIA' | 'LIVE' | 'ARTIST' | 'ALBUM' | 'BRAZIL' | 'COVERS' | 'LYRICS' | 'DISCOVERY' | 'SOUNDTRACKS' | 'GENERATIONS' | 'DANCE' | 'REMIXES' | 'MUSIC_VIDEOS';
export const THEME_CATEGORY_COLORS: Record<ThemeCategory, string> = {
  INSTRUMENTS:'#c2410c', VOCALS:'#7e22ce', EMOTIONS:'#be123c', SITUATIONS:'#0369a1', CHAOS:'#b91c1c', CINEMA:'#4338ca', HOT_TAKE:'#ea580c', NOSTALGIA:'#a16207', LIVE:'#047857', ARTIST:'#6d28d9', ALBUM:'#1d4ed8', BRAZIL:'#15803d', COVERS:'#0f766e', LYRICS:'#9333ea', DISCOVERY:'#0891b2', SOUNDTRACKS:'#4f46e5', GENERATIONS:'#b45309', DANCE:'#db2777', REMIXES:'#2563eb', MUSIC_VIDEOS:'#dc2626'
};

export function themeCategoryColor(category?: string): string {
  const canonicalCategory = category === 'HOT_TAKES' ? 'HOT_TAKE' : category;
  return THEME_CATEGORY_COLORS[canonicalCategory as ThemeCategory] || '#111';
}

@Component({ selector: 'app-theme-card', template: `<article class="theme-card" [class.compact]="compact()" [style.--theme-accent]="accent()"><span class="theme-category">{{ theme().category || theme().type }}</span><h1>{{ theme().title }}</h1>@if (showExample() && theme().example) { <span class="theme-example">{{ theme().example }}</span> }</article>` })
export class ThemeCard {
  readonly theme = input.required<GameTheme>();
  readonly showExample = input(true);
  readonly compact = input(false, { transform: booleanAttribute });
  readonly accent = computed(() => themeCategoryColor(this.theme().category));
}
