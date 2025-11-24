import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationMessage } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of notifications; trackBy: trackByNotificationId" 
        class="notification-toast"
        [class.info]="notification.type === 'info'"
        [class.success]="notification.type === 'success'"
        [class.warning]="notification.type === 'warning'"
        [class.error]="notification.type === 'error'">
        
        <div class="notification-icon">
          <ng-container [ngSwitch]="notification.type">
            <span *ngSwitchCase="'info'">ℹ️</span>
            <span *ngSwitchCase="'success'">✅</span>
            <span *ngSwitchCase="'warning'">⚠️</span>
            <span *ngSwitchCase="'error'">❌</span>
          </ng-container>
        </div>
        
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        
        <button 
          class="notification-close" 
          (click)="closeNotification(notification.id)"
          aria-label="Cerrar notificación">
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      pointer-events: none;
    }
    
    .notification-toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      pointer-events: auto;
      animation: slideInRight 0.3s ease-out;
      position: relative;
      min-width: 300px;
      border-left: 4px solid;
    }
    
    .notification-toast.info {
      background: rgba(33, 150, 243, 0.95);
      border-left-color: #2196f3;
      color: white;
    }
    
    .notification-toast.success {
      background: rgba(76, 175, 80, 0.95);
      border-left-color: #4caf50;
      color: white;
    }
    
    .notification-toast.warning {
      background: rgba(255, 152, 0, 0.95);
      border-left-color: #ff9800;
      color: white;
    }
    
    .notification-toast.error {
      background: rgba(244, 67, 54, 0.95);
      border-left-color: #f44336;
      color: white;
    }
    
    .notification-icon {
      font-size: 20px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    .notification-content {
      flex: 1;
      min-width: 0;
    }
    
    .notification-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
      line-height: 1.2;
    }
    
    .notification-message {
      font-size: 13px;
      line-height: 1.4;
      opacity: 0.95;
    }
    
    .notification-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 18px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s ease;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    .notification-close:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    /* Mobile responsive */
    @media (max-width: 768px) {
      .notification-container {
        top: 60px;
        right: 16px;
        left: 16px;
        max-width: none;
      }
      
      .notification-toast {
        min-width: 0;
        padding: 14px;
      }
      
      .notification-title {
        font-size: 13px;
      }
      
      .notification-message {
        font-size: 12px;
      }
      
      .notification-icon {
        font-size: 18px;
      }
    }
    
    /* Extra small screens */
    @media (max-width: 480px) {
      .notification-container {
        top: 56px;
        right: 12px;
        left: 12px;
      }
      
      .notification-toast {
        padding: 12px;
        gap: 10px;
      }
    }
  `]
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  notifications: NotificationMessage[] = [];
  private subscription: Subscription | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => this.notifications = notifications
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closeNotification(id: string) {
    this.notificationService.remove(id);
  }

  trackByNotificationId(index: number, notification: NotificationMessage): string {
    return notification.id;
  }
}