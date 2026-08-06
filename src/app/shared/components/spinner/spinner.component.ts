import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div
      class="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-label="Loading"
    ></div>
  `,
})
export class SpinnerComponent {}