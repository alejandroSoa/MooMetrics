import { Routes } from '@angular/router';
import { SwTestComponent } from './components/sw-test/sw-test.component';
import { HomeTestComponent } from './components/home-test/home-test.component';
import { NotificationComponent } from './components/notification/notification.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { OtpVerificationComponent } from './components/otp-verification/otp-verification.component';
import { AdminViewComponent } from './components/admin-view/admin-view.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { RolesManagementComponent } from './components/roles-management/roles-management.component';
import { RoleDetailComponent } from './components/role-detail/role-detail.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { StablesManagementComponent } from './components/stables-management/stables-management.component';
import { StableDetailComponent } from './components/stable-detail/stable-detail.component';
import { ChannelCreateComponent } from './components/channel-create/channel-create.component';
import { ChannelDetailComponent } from './components/channel-detail/channel-detail.component';
import { AuthGuard } from './guards/auth.guard';
import { adminGuard, userGuard } from './guards/admin.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'home', 
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
    path: 'otp-verification', 
    component: OtpVerificationComponent
  },
  { 
    path: 'home', 
    component: HomeTestComponent,
    canActivate: [AuthGuard, userGuard]
  },
  { 
    path: 'notifications', 
    component: NotificationComponent,
    canActivate: [AuthGuard, userGuard]
  },
  { 
    path: 'sw-test', 
    component: SwTestComponent,
    canActivate: [AuthGuard, userGuard]
  },
  {
    path: 'admin',
    component: AdminViewComponent,
    canActivate: [AuthGuard, adminGuard]
  },
  {
    path: 'admin/users',
    component: UsersManagementComponent,
    canActivate: [AuthGuard, adminGuard]
  },
  {
    path: 'admin/users/:id',
    component: UserDetailComponent,
    canActivate: [AuthGuard, adminGuard]
  },
  {
    path: 'admin/roles',
    component: RolesManagementComponent,
    canActivate: [AuthGuard, adminGuard]
  },
  {
    path: 'admin/roles/:id',
    component: RoleDetailComponent,
    canActivate: [AuthGuard, adminGuard]
  },
  {
    path: 'admin/stables',
    component: StablesManagementComponent,
    canActivate: [AuthGuard, adminGuard]
  },
  {
    path: 'admin/stables/:id',
    component: StableDetailComponent,
    canActivate: [AuthGuard, adminGuard]
  },
  {
    path: 'admin/channels/:stableId',
    component: ChannelCreateComponent,
    canActivate: [AuthGuard, adminGuard]
  },
  {
    path: 'admin/channels/:id/detail',
    component: ChannelDetailComponent,
    canActivate: [AuthGuard, adminGuard]
  }
];
