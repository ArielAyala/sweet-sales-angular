import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg
          @if (toast.type === 'success') { bg-emerald-600 }
          @else if (toast.type === 'error') { bg-red-600 }
          @else { bg-gray-800 }"
          role="status"
        >
          <span>{{ toast.message }}</span>
          <button
            type="button"
            (click)="toastService.remove(toast.id)"
            class="shrink-0 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  constructor(readonly toastService: ToastService) {}
}