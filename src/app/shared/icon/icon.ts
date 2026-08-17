import { Component, computed, input } from '@angular/core';

export type IconName = 'like' | 'dislike' | 'check' | 'close' | 'external-link' | 'copy' | 'music';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const ICON_PATHS: Record<IconName, string> = {
  like: 'icons/like.svg',
  dislike: 'icons/dislike.svg',
  check: 'icons/check.svg',
  close: 'icons/close.svg',
  'external-link': 'icons/external-link.svg',
  copy: 'icons/copy.svg',
  music: 'icons/music.svg',
};

@Component({
  selector: 'app-icon',
  host: { '[class]': "'app-icon icon-' + size()", '[attr.role]': "ariaLabel() ? 'img' : null", '[attr.aria-label]': 'ariaLabel() || null', '[attr.aria-hidden]': "ariaLabel() ? null : 'true'" },
  template: `<span class="icon-mask" [style.--icon-source]="source()"></span>`,
})
export class AppIcon {
  readonly name = input.required<IconName>();
  readonly size = input<IconSize>('md');
  readonly ariaLabel = input('');
  readonly source = computed(() => `url("${ICON_PATHS[this.name()]}")`);
}
