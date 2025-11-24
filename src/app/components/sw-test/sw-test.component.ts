import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CacheStatusComponent } from '../cache-status/cache-status.component';

@Component({
  selector: 'app-sw-test',
  standalone: true,
  imports: [CommonModule, CacheStatusComponent],
  templateUrl: './sw-test.component.html',
  styleUrls: ['./sw-test.component.css']
})
export class SwTestComponent implements OnInit {
  isOnline = navigator.onLine;
  canInstall = false;
  isInstalled = false;
  hasServiceWorker = 'serviceWorker' in navigator;
  swRegistration: ServiceWorkerRegistration | null = null;
  hasUpdate = false;
  deviceInfo = this.getDeviceInfo();
  installPrompt: any = null;

  ngOnInit() {
    this.checkInstallability();
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.checkOnlineStatus();
  }

  private getDeviceInfo() {
    const ua = navigator.userAgent;
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isMobile = isAndroid || isIOS;
    
    let browser = 'Unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    return {
      platform: isAndroid ? 'Android' : isIOS ? 'iOS' : 'Desktop',
      browser,
      isMobile,
      isAndroid,
      isIOS
    };
  }

  private checkInstallability() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }
  }

  private async registerServiceWorker() {
    if (!this.hasServiceWorker) return;

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', this.swRegistration);
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event;
      this.canInstall = true;
    });
  }

  private checkOnlineStatus() {
    window.addEventListener('online', () => this.isOnline = true);
    window.addEventListener('offline', () => this.isOnline = false);
  }

  async installApp() {
    if (!this.installPrompt) return;

    const result = await this.installPrompt.prompt();
    if (result.outcome === 'accepted') {
      this.canInstall = false;
      this.isInstalled = true;
    }
  }

  testOfflineFeature() {
    alert('This would demonstrate offline functionality in a real PWA!');
  }
}
