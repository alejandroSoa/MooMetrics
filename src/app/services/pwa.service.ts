import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any = null;
  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  public updateAvailable$ = this.updateAvailableSubject.asObservable();
  private isUpdating = false;

  constructor(private swUpdate: SwUpdate) {
    this.initializeUpdateService();
    this.initializeInstallPrompt();
  }

  private initializeUpdateService() {
    if (this.swUpdate.isEnabled) {
      // Verificar actualizaciones cada 30 minutos
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, 30 * 60 * 1000);

      // Escuchar cuando hay una nueva versión disponible
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.updateAvailableSubject.next(true);
        });

      // Verificar actualizaciones inmediatamente al iniciar
      this.swUpdate.checkForUpdate();
    }
  }

  private initializeInstallPrompt() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.promptEvent = e;
    });
  }

  // Método para aplicar actualización con UI moderna
  async applyUpdate(): Promise<boolean> {
    if (this.isUpdating || !this.swUpdate.isEnabled) {
      return false;
    }

    try {
      this.isUpdating = true;
      await this.swUpdate.activateUpdate();
      this.updateAvailableSubject.next(false);
      // Recargar después de un pequeño delay para mejor UX
      setTimeout(() => {
        window.location.reload();
      }, 500);
      return true;
    } catch (error) {
      console.error('Error al aplicar actualización:', error);
      this.isUpdating = false;
      return false;
    }
  }

  // Método público para verificar actualizaciones manualmente
  async checkForUpdates(): Promise<boolean> {
    if (this.swUpdate.isEnabled) {
      try {
        const updateFound = await this.swUpdate.checkForUpdate();
        return updateFound;
      } catch (error) {
        console.error('Error al verificar actualizaciones:', error);
        return false;
      }
    }
    return false;
  }

  canInstall(): boolean {
    return !!this.promptEvent;
  }

  async install(): Promise<boolean> {
    if (!this.promptEvent) {
      return false;
    }

    try {
      this.promptEvent.prompt();
      const result = await this.promptEvent.userChoice;
      
      this.promptEvent = null;
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('Error durante la instalación:', error);
      return false;
    }
  }

  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  showIOSInstallInstructions(): void {
    // Este método será reemplazado por el componente moderno
    console.log('Mostrando instrucciones de instalación para iOS');
  }

  dismissUpdateForSession(): void {
    this.updateAvailableSubject.next(false);
  }
}