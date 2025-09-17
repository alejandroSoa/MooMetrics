import { Component } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';

interface Notification {
  type: 'abortion' | 'fresh' | 'hoof' | 'daysInMilk' | 'cull' | 'breed';
  message: string;
  date: Date;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  imports: [CommonModule, TitleCasePipe],
  providers: [DatePipe]
})
export class NotificationComponent {
  notifications: Notification[] = [
    { type: 'abortion', message: 'Abortion detected for cow #13241', date: new Date('2024-06-01T10:00:00') },
    { type: 'fresh', message: 'Fresh cow this week: #14567', date: new Date('2024-06-02T08:30:00') },
    { type: 'hoof', message: 'Hoof trimming scheduled for cow #12345', date: new Date('2024-06-03T09:00:00') },
    { type: 'daysInMilk', message: 'Cow #13241 has 120 days in milk', date: new Date('2024-06-04T11:15:00') },
    { type: 'cull', message: 'Cow #12001 marked for culling', date: new Date('2024-06-05T14:20:00') },
    { type: 'breed', message: 'Breeding event for cow #14567', date: new Date('2024-06-06T16:45:00') }
  ];
}
