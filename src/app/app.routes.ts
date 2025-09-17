import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SwTestComponent } from './components/sw-test/sw-test.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sw/test', component: SwTestComponent },
  { path: '**', redirectTo: '' }
];
