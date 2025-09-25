import { Routes } from '@angular/router';
import { SwTestComponent } from './components/sw-test/sw-test.component';
import { HomeTestComponent } from './components/home-test/home-test.component';
import { NotificationComponent } from './components/notification/notification.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'home', 
    pathMatch: 'full' 
  },
  { 
    path: 'home', 
    component: HomeTestComponent
  },
  { 
    path: 'notifications', 
    component: NotificationComponent
  },
  { 
    path: 'sw-test', 
    component: SwTestComponent
  }
];
