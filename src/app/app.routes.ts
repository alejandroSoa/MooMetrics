import { Routes } from '@angular/router';
import { SwTestComponent } from './components/sw-test/sw-test.component';
import { HomeTestComponent } from './components/home-test/home-test.component';
import { NotificationComponent } from './components/notification/notification.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent
  },
  { 
    path: 'register', 
    component: RegisterComponent
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
