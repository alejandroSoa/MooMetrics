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
  
  // Device Detection Signals
  protected readonly isMobile = signal(false);
  protected readonly isAndroid = signal(false);
  protected readonly isIOS = signal(false);
  protected readonly deviceType = signal('Desktop');
  protected readonly browserName = signal('Unknown');
  protected readonly canInstallPWA = signal(false);

  private swUpdate = inject(SwUpdate);

  ngOnInit() {
    this.detectDevice();
    this.checkServiceWorkerStatus();
    this.setupInstallPrompt();
    this.setupOnlineStatus();
    this.checkForUpdates();
    this.checkPWADisplayMode();
  }

  private detectDevice() {
    const userAgent = navigator.userAgent;
    console.log('User Agent:', userAgent); // Debug log
    
    // Enhanced Mobile Detection
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);
    this.isMobile.set(isMobileDevice);
    
    // Android Detection
    const isAndroidDevice = /Android/i.test(userAgent);
    this.isAndroid.set(isAndroidDevice);
    
    // iOS Detection
    const isIOSDevice = /iPhone|iPad|iPod/i.test(userAgent);
    this.isIOS.set(isIOSDevice);
    
    // Enhanced Device Type Detection
    if (isAndroidDevice) {
      this.deviceType.set('Android Mobile');
    } else if (isIOSDevice) {
      this.deviceType.set('iOS Mobile');
    } else if (isMobileDevice) {
      this.deviceType.set('Mobile Device');
    } else {
      // Desktop/PC Detection
      if (/Windows/i.test(userAgent)) {
        this.deviceType.set('Windows PC');
      } else if (/Mac/i.test(userAgent) && !/Mobile/i.test(userAgent)) {
        this.deviceType.set('Mac Desktop');
      } else if (/Linux/i.test(userAgent)) {
        this.deviceType.set('Linux PC');
      } else {
        this.deviceType.set('Desktop/PC');
      }
    }
    
    // Enhanced Browser Detection
    if (userAgent.includes('Edg/')) {
      this.browserName.set('Microsoft Edge');
    } else if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
      this.browserName.set('Google Chrome');
    } else if (userAgent.includes('Firefox/')) {
      this.browserName.set('Mozilla Firefox');
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
      this.browserName.set('Safari');
    } else if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) {
      this.browserName.set('Opera');
    } else {
      this.browserName.set('Unknown Browser');
    }
    
    // Enhanced PWA Installation Capability
    const canInstall = (isAndroidDevice && (userAgent.includes('Chrome') || userAgent.includes('Edg'))) || 
                      (isIOSDevice && userAgent.includes('Safari')) ||
                      (!isMobileDevice && (userAgent.includes('Chrome') || userAgent.includes('Edg')));
    this.canInstallPWA.set(canInstall);
    
    // Debug logging
    console.log('Device Detection Results:', {
      isMobile: isMobileDevice,
      isAndroid: isAndroidDevice,
      isIOS: isIOSDevice,
      deviceType: this.deviceType(),
      browser: this.browserName(),
      canInstallPWA: canInstall
    });
  }

  private checkPWADisplayMode() {
    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled.set(true);
    }
    
    // Check for iOS standalone mode
    if ((window.navigator as any).standalone === true) {
      this.isInstalled.set(true);
    }
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
          this.isInstalled.set(true);
        }
      });
    } else if (this.isIOS()) {
      // Show iOS-specific install instructions
      this.showIOSInstallInstructions();
    }
  }

  showIOSInstallInstructions() {
    const message = `To install this PWA on iOS:
    
📱 Safari Browser:
1. Tap the Share button (□↗)
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to install

🎉 The app will appear on your home screen!`;
    
    alert(message);
  }

  getMobileInstallInstructions(): string {
    if (this.isAndroid()) {
      return 'Tap "Install App" or look for the install prompt in Chrome';
    } else if (this.isIOS()) {
      return 'Use Safari: Share → Add to Home Screen';
    }
    return 'Install prompts vary by device and browser';
  }

  getDeviceIcon(): string {
    if (this.isAndroid()) return '🤖';
    if (this.isIOS()) return '🍎';
    if (this.isMobile()) return '📱';
    
    // Desktop/PC specific icons
    const deviceType = this.deviceType();
    if (deviceType.includes('Windows')) return '🖥️';
    if (deviceType.includes('Mac')) return '🖥️';
    if (deviceType.includes('Linux')) return '🐧';
    
    return '💻';
  }

  updateApp() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.activateUpdate().then(() => {
        window.location.reload();
      });
    }
  }

  testOfflineCapability() {
    const deviceMsg = this.isMobile() ? 
      'Turn off WiFi/Data and refresh - the app will still work!' :
      'Go to DevTools → Network → Offline and refresh - the app will still work!';
      
    alert(`🔄 Testing PWA Offline Capability:\n\n${deviceMsg}\n\n✅ Service Worker is caching everything!`);
  }
}
