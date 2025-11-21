import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDownload, faTimes, faMobile, faDesktop, faSync, faRocket } from '@fortawesome/free-solid-svg-icons';
import { PwaService } from '../../services/pwa.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <!-- Install Prompt -->
    <div class="pwa-prompt install-prompt" *ngIf="showInstallPrompt()">
      <div class="prompt-content">
        <div class="prompt-header">
          <div class="prompt-icon install-icon">
            <fa-icon [icon]="faDownload"></fa-icon>
          </div>
          <button class="close-btn" (click)="dismissInstallPrompt()">
            <fa-icon [icon]="faTimes"></fa-icon>
          </button>
        </div>
        <div class="prompt-body">
          <h3>¡Instala MooMetrics!</h3>
          <p>Obtén la mejor experiencia instalando nuestra app</p>
          <div class="benefits">
            <div class="benefit">
              <fa-icon [icon]="faRocket"></fa-icon>
              <span>Más rápido</span>
            </div>
            <div class="benefit">
              <fa-icon [icon]="faMobile"></fa-icon>
              <span>Funciona offline</span>
            </div>
            <div class="benefit">
              <fa-icon [icon]="faDesktop"></fa-icon>
              <span>Como app nativa</span>
            </div>
          </div>
        </div>
        <div class="prompt-actions">
          <button class="secondary-btn" (click)="dismissInstallPrompt()">Ahora no</button>
          <button class="primary-btn" (click)="installApp()">
            <fa-icon [icon]="faDownload"></fa-icon>
            Instalar
          </button>
        </div>
      </div>
    </div>

    <!-- Update Prompt -->
    <div class="pwa-prompt update-prompt" *ngIf="showUpdatePrompt()">
      <div class="prompt-content">
        <div class="prompt-header">
          <div class="prompt-icon update-icon">
            <fa-icon [icon]="faSync" [class.spinning]="isUpdating()"></fa-icon>
          </div>
          <button class="close-btn" (click)="dismissUpdatePrompt()" [disabled]="isUpdating()">
            <fa-icon [icon]="faTimes"></fa-icon>
          </button>
        </div>
        <div class="prompt-body">
          <h3>¡Actualización disponible!</h3>
          <p>Hay una nueva versión con mejoras y nuevas funciones</p>
          <div class="benefits">
            <div class="benefit">
              <fa-icon [icon]="faRocket"></fa-icon>
              <span>Mejoras de rendimiento</span>
            </div>
            <div class="benefit">
              <fa-icon [icon]="faMobile"></fa-icon>
              <span>Nuevas funciones</span>
            </div>
          </div>
        </div>
        <div class="prompt-actions">
          <button class="secondary-btn" (click)="dismissUpdatePrompt()" [disabled]="isUpdating()">Más tarde</button>
          <button class="primary-btn" (click)="updateApp()" [disabled]="isUpdating()">
            <fa-icon [icon]="faSync" [class.spinning]="isUpdating()"></fa-icon>
            {{ isUpdating() ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pwa-prompt {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
      max-width: 340px;
      z-index: 1000;
      animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: 1px solid #e8e8e8;
      backdrop-filter: blur(10px);
    }

    @keyframes slideIn {
      from {
        transform: translateX(120%) scale(0.8);
        opacity: 0;
      }
      to {
        transform: translateX(0) scale(1);
        opacity: 1;
      }
    }

    .prompt-content {
      padding: 0;
      overflow: hidden;
    }

    .prompt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 12px 20px;
      border-bottom: 1px solid #f8f8f8;
    }

    .prompt-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      position: relative;
      overflow: hidden;
    }

    .install-icon {
      background: linear-gradient(135deg, #4a4a4a 0%, #2c2c2c 100%);
    }

    .update-icon {
      background: linear-gradient(135deg, #6c6c6c 0%, #404040 100%);
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .close-btn {
      background: none;
      border: none;
      color: #aaa;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .close-btn:hover:not(:disabled) {
      background: #f5f5f5;
      color: #666;
    }

    .close-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .prompt-body {
      padding: 0 20px 20px 20px;
    }

    .prompt-body h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      font-family: 'Roboto', sans-serif;
    }

    .prompt-body p {
      margin: 0 0 16px 0;
      color: #6c6c6c;
      font-size: 14px;
      line-height: 1.5;
      font-family: 'Roboto', sans-serif;
    }

    .benefits {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    .benefit {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: #4a4a4a;
      font-size: 12px;
      font-weight: 500;
      font-family: 'Roboto', sans-serif;
      text-align: center;
      flex: 1;
    }

    .benefit fa-icon {
      color: #4a4a4a;
      font-size: 16px;
      background: #f5f5f5;
      padding: 8px;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .prompt-actions {
      padding: 0 20px 20px 20px;
      display: flex;
      gap: 12px;
    }

    .secondary-btn,
    .primary-btn {
      padding: 12px 20px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Roboto', sans-serif;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .secondary-btn {
      background: #f8f9fa;
      color: #6c757d;
      border: 1px solid #e9ecef;
    }

    .secondary-btn:hover:not(:disabled) {
      background: #e9ecef;
      color: #495057;
    }

    .primary-btn {
      background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
      color: #fff;
      box-shadow: 0 4px 15px rgba(44, 44, 44, 0.4);
    }

    .update-prompt .primary-btn {
      background: linear-gradient(135deg, #4a4a4a 0%, #2c2c2c 100%);
      box-shadow: 0 4px 15px rgba(74, 74, 74, 0.4);
    }

    .primary-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(44, 44, 44, 0.6);
    }

    .update-prompt .primary-btn:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(74, 74, 74, 0.6);
    }

    .primary-btn:disabled,
    .secondary-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    @media (max-width: 768px) {
      .pwa-prompt {
        bottom: 16px;
        left: 16px;
        right: 16px;
        max-width: none;
        margin: 0;
      }
      
      .benefits {
        justify-content: space-around;
      }
    }
  `]
})
export class InstallPromptComponent implements OnInit, OnDestroy {
  // Icons
  faDownload = faDownload;
  faTimes = faTimes;
  faMobile = faMobile;
  faDesktop = faDesktop;
  faSync = faSync;
  faRocket = faRocket;
  
  // State signals
  showInstallPrompt = signal(false);
  showUpdatePrompt = signal(false);
  isUpdating = signal(false);
  
  private updateSubscription?: Subscription;

  constructor(private pwaService: PwaService) {}

  ngOnInit() {
    this.checkInstallPrompt();
    this.subscribeToUpdates();
  }

  ngOnDestroy() {
    this.updateSubscription?.unsubscribe();
  }

  private checkInstallPrompt() {
    // Si la app ya está instalada, no mostrar
    if (this.pwaService.isInstalled()) {
      return;
    }

    // Para móviles, siempre mostrar después de un delay (sin localStorage)
    if (this.pwaService.isMobile()) {
      setTimeout(() => {
        if (this.pwaService.canInstall() || this.pwaService.isIOS()) {
          this.showInstallPrompt.set(true);
        }
      }, 4000); // 4 segundos de delay
      return;
    }

    // Para desktop, usar localStorage como antes
    const dismissed = localStorage.getItem('moo_install_prompt_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysPassed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysPassed < 7) {
        return;
      }
    }

    setTimeout(() => {
      if (this.pwaService.canInstall()) {
        this.showInstallPrompt.set(true);
      }
    }, 3000);
  }

  private subscribeToUpdates() {
    this.updateSubscription = this.pwaService.updateAvailable$.subscribe(updateAvailable => {
      this.showUpdatePrompt.set(updateAvailable);
    });
  }

  async installApp() {
    if (this.pwaService.canInstall()) {
      const installed = await this.pwaService.install();
      if (installed) {
        this.showInstallPrompt.set(false);
      }
    } else if (this.pwaService.isIOS()) {
      this.showIOSInstallModal();
    }
  }

  private showIOSInstallModal() {
    // Crear modal moderno para iOS
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      ">
        <div style="
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 320px;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="font-size: 24px; margin-bottom: 16px;">📱</div>
          <h3 style="margin: 0 0 12px 0; color: #333;">Instalar MooMetrics</h3>
          <p style="color: #666; font-size: 14px; line-height: 1.4; margin-bottom: 20px;">
            Para instalar la app en tu iPhone/iPad:
          </p>
          <div style="text-align: left; margin-bottom: 20px; font-size: 14px; color: #555;">
            <div style="margin-bottom: 8px;">1. Toca el botón <strong>Compartir</strong> ⬆️</div>
            <div style="margin-bottom: 8px;">2. Selecciona <strong>"Añadir a pantalla de inicio"</strong></div>
            <div>3. Toca <strong>"Añadir"</strong></div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #007AFF;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
          ">Entendido</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.showInstallPrompt.set(false);
  }

  async updateApp() {
    this.isUpdating.set(true);
    try {
      const success = await this.pwaService.applyUpdate();
      if (!success) {
        // Si falla, mostrar mensaje de error
        this.showErrorMessage('Error al actualizar. Intenta recargar la página.');
      }
    } finally {
      this.isUpdating.set(false);
    }
  }

  private showErrorMessage(message: string) {
    // Aquí podrías integrar con un servicio de notificaciones
    console.error(message);
    alert(message);
  }

  dismissInstallPrompt() {
    this.showInstallPrompt.set(false);
    // Solo guardar en localStorage para desktop
    if (!this.pwaService.isMobile()) {
      localStorage.setItem('moo_install_prompt_dismissed', Date.now().toString());
    }
  }

  dismissUpdatePrompt() {
    this.pwaService.dismissUpdateForSession();
    this.showUpdatePrompt.set(false);
  }

  // Método legacy para compatibilidad
  dismissPrompt() {
    this.dismissInstallPrompt();
  }
}