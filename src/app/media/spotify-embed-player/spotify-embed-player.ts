import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-spotify-embed-player',
  template: `<iframe class="media-frame spotify-frame" [src]="embedUrl()" title="Spotify player" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="eager"></iframe>`,
})
export class SpotifyEmbedPlayer {
  readonly trackId = input.required<string>();
  private readonly sanitizer = inject(DomSanitizer);
  readonly embedUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(`https://open.spotify.com/embed/track/${encodeURIComponent(this.trackId())}`));
}
