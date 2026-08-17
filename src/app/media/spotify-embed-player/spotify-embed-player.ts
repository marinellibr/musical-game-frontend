import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Skeleton } from '../../shared/skeleton/skeleton';

@Component({
  selector: 'app-spotify-embed-player',
  imports: [Skeleton],
  template: `<div class="media-embed spotify-frame">@if (failed()) { <p class="embed-error">Não foi possível carregar esta mídia.</p> } @else { @if (!loaded()) { <app-skeleton variant="media" label="Carregando player do Spotify" /> }<iframe class="media-frame" [class.loaded]="loaded()" [src]="embedUrl()" title="Spotify player" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="eager" (load)="loaded.set(true)" (error)="failed.set(true)"></iframe> }</div>`,
})
export class SpotifyEmbedPlayer {
  readonly trackId = input.required<string>();
  private readonly sanitizer = inject(DomSanitizer);
  readonly embedUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(`https://open.spotify.com/embed/track/${encodeURIComponent(this.trackId())}`));
  readonly loaded = signal(false);
  readonly failed = signal(false);
}
