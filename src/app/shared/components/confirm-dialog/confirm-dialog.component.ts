import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, TranslatePipe],
  template: `
    @if (open()) {
      <app-modal [title]="title()" (closeEvent)="onCancel()">
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ message() }}</p>
        <div class="mt-6 flex justify-end gap-3">
          <app-button variant="ghost" (clickEvent)="onCancel()">
            {{ 'cancel' | translate }}
          </app-button>
          <app-button [variant]="danger() ? 'danger' : 'primary'" (clickEvent)="onConfirm()">
            {{ confirmLabel() }}
          </app-button>
        </div>
      </app-modal>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly message = input('');
  readonly confirmLabel = input('');
  readonly danger = input(true);

  readonly confirmEvent = output<void>();
  readonly cancelEvent = output<void>();

  onConfirm(): void {
    this.confirmEvent.emit();
  }

  onCancel(): void {
    this.cancelEvent.emit();
  }
}