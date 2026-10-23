import { Injectable, signal } from '@angular/core';
import { NotificationMessage } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationsSignal = signal<NotificationMessage[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();

  showSuccess(message: string, duration = 4000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      message,
      duration
    });
  }

  showError(message: string, duration = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      message,
      duration
    });
  }

  showInfo(message: string, duration = 3500): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      message,
      duration
    });
  }

  dismiss(id: string): void {
    this.notificationsSignal.update((notifications) =>
      notifications.filter((n) => n.id !== id)
    );
  }

  private addNotification(notification: NotificationMessage): void {
    this.notificationsSignal.update((current) => [...current, notification]);

    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
