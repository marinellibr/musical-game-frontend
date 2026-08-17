import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Skeleton } from '../../shared/skeleton/skeleton';

@Component({
  selector: 'app-youtube-player',
  imports: [Skeleton],
  template: `<div class="media-embed youtube-frame">@if (failed()) { <p class="embed-error">Não foi possível carregar esta mídia.</p> } @else { @if (!loaded()) { <app-skeleton variant="media" label="Carregando player do YouTube" /> }<iframe class="media-frame" [class.loaded]="loaded()" [src]="embedUrl()" title="YouTube player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="eager" (load)="loaded.set(true)" (error)="failed.set(true)"></iframe> }</div>`,
})
export class YoutubePlayer {
  readonly videoId = input.required<string>();
  readonly startTime = input(0);
  private readonly sanitizer = inject(DomSanitizer);
  readonly embedUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${encodeURIComponent(this.videoId())}?start=${Math.max(0, Math.floor(this.startTime()))}&enablejsapi=1`));
  readonly loaded = signal(false);
  readonly failed = signal(false);
}
