import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { UpdateService } from './services/update.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideIonicAngular({}),
    provideServiceWorker('ngsw-worker.js', {
            enabled: true, // Always enable service workers
            registrationStrategy: 'registerWhenStable:30000'
          }),
    {
      provide: APP_INITIALIZER,
      useFactory: (updateService: UpdateService) => () => updateService.initializeUpdateService(),
      deps: [UpdateService],
      multi: true
    }
  ]
};
