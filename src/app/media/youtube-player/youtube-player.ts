import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-youtube-player',
  template: `<iframe class="media-frame youtube-frame" [src]="embedUrl()" title="YouTube player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="eager"></iframe>`,
})
export class YoutubePlayer {
  readonly videoId = input.required<string>();
  readonly startTime = input(0);
  private readonly sanitizer = inject(DomSanitizer);
  readonly embedUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${encodeURIComponent(this.videoId())}?start=${Math.max(0, Math.floor(this.startTime()))}&enablejsapi=1`));
}
