import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div class="flex size-16 items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-500/10">
        <ng-content select="[icon]" />
      </div>
      <p class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ title() }}</p>
      @if (hint()) {
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ hint() }}</p>
      }
      <ng-content select="[action]" />
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input<string>('');
  readonly hint = input<string>('');
}