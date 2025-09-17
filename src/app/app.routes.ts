import { Routes } from '@angular/router';
import { SwTestComponent } from './components/sw-test/sw-test.component';
import { HomeTestComponent } from './components/home-test/home-test.component';
import { NotificationComponent } from './components/notification/notification.component';

export const routes: Routes = [
  { path: 'home', component: HomeTestComponent },
  { path: 'sw/test', component: SwTestComponent },
  { path: 'notifications/test', component: NotificationComponent },
  { path: '**', redirectTo: 'home' }
];
