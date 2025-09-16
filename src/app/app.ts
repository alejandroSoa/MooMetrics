import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('MooMetrics - PWA Demo');
  protected readonly isOnline = signal(navigator.onLine);
  protected readonly serviceWorkerEnabled = signal(false);
  protected readonly updateAvailable = signal(false);
  protected readonly installPromptEvent = signal<any>(null);
  protected readonly isInstalled = signal(false);

  private swUpdate = inject(SwUpdate);

  ngOnInit() {
    this.checkServiceWorkerStatus();
    this.setupInstallPrompt();
    this.setupOnlineStatus();
    this.checkForUpdates();
  }

  private checkServiceWorkerStatus() {
    if ('serviceWorker' in navigator) {
      this.serviceWorkerEnabled.set(true);
      navigator.serviceWorker.ready.then(() => {
        console.log('Service Worker is ready');
      });
    }
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPromptEvent.set(e);
    });

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.installPromptEvent.set(null);
    });

    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled.set(true);
    }
  }

  private setupOnlineStatus() {
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }

  private checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.updateAvailable.set(true);
        });
    }
  }

  installApp() {
    const promptEvent = this.installPromptEvent();
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice.then((result: any) => {
        if (result.outcome === 'accepted') {
          this.installPromptEvent.set(null);
        }
      });
    }
  }

  updateApp() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.activateUpdate().then(() => {
        window.location.reload();
      });
    }
  }

  testOfflineCapability() {
    // This will demonstrate that the app works offline
    alert('This demonstrates that the app continues to work offline thanks to the service worker cache!');
  }
}
