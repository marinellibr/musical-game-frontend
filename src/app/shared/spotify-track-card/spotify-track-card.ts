import { booleanAttribute, Component, input, output, signal } from '@angular/core';
import { SpotifyTrack } from '../../core/models/room.models';
import { Skeleton } from '../skeleton/skeleton';
import { AppIcon } from '../icon/icon';

@Component({
  selector: 'app-spotify-track-card',
  imports: [AppIcon, Skeleton],
  template: `
    <article class="spotify-track-card" [class.selected]="selected()" [class.compact]="compact()">
      <div class="track-cover">
        @if (track().image && !imageFailed()) {
          @if (!imageLoaded()) { <app-skeleton variant="track" label="Carregando capa" /> }
          <img [class.loaded]="imageLoaded()" [src]="track().image" [alt]="'Capa de ' + track().title" (load)="imageLoaded.set(true)" (error)="imageFailed.set(true)" />
        } @else { <span class="cover-placeholder"><app-icon name="music" size="lg" /></span> }
      </div>
      <div class="track-copy">
        <strong [title]="track().title">{{ track().title }}</strong>
        @if (track().artist) { <span [title]="track().artist">{{ track().artist }}</span> }
        @if (track().album) { <small [title]="track().album">{{ track().album }}</small> }
      </div>
      @if (buttonLabel()) {
        <button class="track-action" type="button" [disabled]="disabled()" (click)="chosen.emit()">{{ buttonLabel() }}</button>
      }
    </article>
  `,
})
export class SpotifyTrackCard {
  readonly track = input.required<SpotifyTrack>();
  readonly selected = input(false, { transform: booleanAttribute });
  readonly buttonLabel = input('ESCOLHER');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly compact = input(false, { transform: booleanAttribute });
  readonly chosen = output<void>();
  readonly imageLoaded = signal(false);
  readonly imageFailed = signal(false);
}
