import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { PwaService } from './services/pwa.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideIonicAngular({}),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
            enabled: true, // Always enable service workers
            registrationStrategy: 'registerWhenStable:30000'
          }),
    {
      provide: APP_INITIALIZER,
      useFactory: (pwaService: PwaService) => () => {
        // PwaService se inicializa automáticamente en su constructor
        return Promise.resolve();
      },
      deps: [PwaService],
      multi: true
    }
  ]
};
