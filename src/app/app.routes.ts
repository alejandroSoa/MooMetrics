import { Routes } from '@angular/router';
import { Home } from './home/home';
import { SwTest } from './sw-test/sw-test';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'sw/test', component: SwTest },
  { path: '**', redirectTo: '' } // Wildcard route para rutas no encontradas
];
