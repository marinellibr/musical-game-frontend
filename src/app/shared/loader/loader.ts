import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `<span class="loader-component" [class.compact]="compact()" role="status" aria-live="polite"><span class="circular-loader" aria-hidden="true"></span>@if (label()) { <span>{{ label() }}</span> }</span>`,
})
export class Loader { readonly label = input(''); readonly compact = input(false, { transform: booleanAttribute }); }
