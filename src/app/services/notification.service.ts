import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 = persistent
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationMessage[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private notifications: NotificationMessage[] = [];
  private nextId = 1;

  constructor() {}

  /**
   * Show an info notification
   */
  info(title: string, message: string, duration: number = 5000): string {
    return this.addNotification('info', title, message, duration);
  }

  /**
   * Show a success notification
   */
  success(title: string, message: string, duration: number = 4000): string {
    return this.addNotification('success', title, message, duration);
  }

  /**
   * Show a warning notification
   */
  warning(title: string, message: string, duration: number = 6000): string {
    return this.addNotification('warning', title, message, duration);
  }

  /**
   * Show an error notification
   */
  error(title: string, message: string, duration: number = 8000): string {
    return this.addNotification('error', title, message, duration);
  }

  /**
   * Show a persistent notification (doesn't auto-dismiss)
   */
  persistent(type: 'info' | 'success' | 'warning' | 'error', title: string, message: string): string {
    return this.addNotification(type, title, message, 0);
  }

  /**
   * Show offline notification
   */
  showOfflineNotification(): string {
    return this.warning(
      '🔴 Sin conexión',
      'Estás offline. Los datos mostrados son de tu última conexión.'
    );
  }

  /**
   * Show online notification
   */
  showOnlineNotification(): string {
    return this.success(
      '🟢 Conexión restaurada',
      'Ya tienes conexión. Los datos se actualizarán automáticamente.'
    );
  }

  /**
   * Show cache notification
   */
  showCacheNotification(dataType: string): string {
    return this.info(
      '📦 Datos del caché',
      `Mostrando ${dataType} guardados offline.`,
      3000
    );
  }

  /**
   * Show sync notification
   */
  showSyncNotification(): string {
    return this.info(
      '🔄 Sincronizando',
      'Actualizando datos con la información más reciente...',
      2000
    );
  }

  /**
   * Add a notification
   */
  private addNotification(
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    duration: number
  ): string {
    const notification: NotificationMessage = {
      id: `notification_${this.nextId++}`,
      type,
      title,
      message,
      duration,
      timestamp: Date.now()
    };

    this.notifications.push(notification);
    this.notificationsSubject.next([...this.notifications]);

    // Auto-remove after duration (if not persistent)
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }

    return notification.id;
  }

  /**
   * Remove a notification by ID
   */
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notificationsSubject.next([...this.notifications]);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
    this.notificationsSubject.next([]);
  }

  /**
   * Get current notifications
   */
  getNotifications(): NotificationMessage[] {
    return [...this.notifications];
  }
}