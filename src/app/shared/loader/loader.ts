import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `<div class="loader-component" role="status" aria-live="polite"><span class="circular-loader" aria-hidden="true"></span>@if (label()) { <p>{{ label() }}</p> }</div>`,
})
export class Loader { readonly label = input(''); }
