import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any = null;

  constructor(private swUpdate: SwUpdate) {
    // Listen for app updates
    if (swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.showUpdateNotification();
        });
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.promptEvent = e;
    });
  }

  private showUpdateNotification() {
    const updateConfirm = confirm(
      '¡Nueva versión disponible! ¿Quieres actualizar la aplicación?'
    );
    
    if (updateConfirm) {
      window.location.reload();
    }
  }

  canInstall(): boolean {
    return !!this.promptEvent;
  }

  async install(): Promise<boolean> {
    if (!this.promptEvent) {
      return false;
    }

    this.promptEvent.prompt();
    const result = await this.promptEvent.userChoice;
    
    this.promptEvent = null;
    return result.outcome === 'accepted';
  }

  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  showIOSInstallInstructions() {
    alert(
      'Para instalar MooMetrics en tu iPhone/iPad:\n\n' +
      '1. Toca el botón Compartir ⬆️ en Safari\n' +
      '2. Selecciona "Añadir a pantalla de inicio"\n' +
      '3. Toca "Añadir"\n\n' +
      '¡La app aparecerá como una aplicación nativa!'
    );
  }
}