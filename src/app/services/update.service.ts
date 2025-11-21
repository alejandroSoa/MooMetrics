import { Injectable } from '@angular/core';
import { PwaService } from './pwa.service';

/**
 * @deprecated Este servicio está obsoleto. 
 * Usa PwaService directamente para funcionalidad de actualización.
 * Se mantiene por compatibilidad con versiones anteriores.
 */
@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  constructor(private pwaService: PwaService) {
    console.warn('UpdateService está obsoleto. Usa PwaService para funcionalidad de PWA.');
  }

  /**
   * @deprecated Usa PwaService directamente
   */
  initializeUpdateService() {
    // No hacer nada - PwaService se inicializa automáticamente
    console.warn('initializeUpdateService está obsoleto. PwaService se inicializa automáticamente.');
  }

  /**
   * @deprecated Usa PwaService.checkForUpdates()
   */
  async checkForUpdates() {
    const updateFound = await this.pwaService.checkForUpdates();
    if (!updateFound) {
      alert('Ya tienes la versión más reciente de la aplicación.');
    }
  }
}