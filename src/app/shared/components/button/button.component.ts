import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      (click)="onClick()"
      class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50
      @if (variant() === 'primary') {
        bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700
      } @else if (variant() === 'secondary') {
        bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700
      } @else if (variant() === 'danger') {
        bg-red-500 text-white hover:bg-red-600 active:bg-red-700
      } @else {
        bg-transparent text-primary-600 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-500/10
      }"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit'>('button');

  readonly clickEvent = output<void>();

  onClick(): void {
    this.clickEvent.emit();
  }
}