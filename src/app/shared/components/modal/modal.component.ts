import { Component, input, output } from '@angular/core';

/**
 * Modal dialog with backdrop. Emits close when the backdrop or close button is pressed.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      (click)="onBackdropClick()"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="title() || undefined"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      <div
        class="relative z-10 w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lg sm:rounded-2xl dark:bg-gray-800"
        (click)="$event.stopPropagation()"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">
            {{ title() }}
          </h2>
          <button
            type="button"
            (click)="onClose()"
            class="flex size-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ng-content />
      </div>
    </div>
  `,
})
export class ModalComponent {
  readonly title = input<string>('');
  readonly closeEvent = output<void>();

  onClose(): void {
    this.closeEvent.emit();
  }

  onBackdropClick(): void {
    this.closeEvent.emit();
  }
}