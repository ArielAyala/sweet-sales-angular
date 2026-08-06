import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let nextId = 1;

/**
 * Simple toast notification manager. Renders via the ToastsContainer component.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private push(message: string, type: Toast['type']): void {
    const toast: Toast = { id: nextId++, message, type };
    this.toasts.update((current) => [...current, toast]);
    setTimeout(() => this.remove(toast.id), 3000);
  }

  success(message: string): void {
    this.push(message, 'success');
  }

  error(message: string): void {
    this.push(message, 'error');
  }

  info(message: string): void {
    this.push(message, 'info');
  }

  remove(id: number): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}