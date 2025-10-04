import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDownload, faTimes, faMobile, faDesktop } from '@fortawesome/free-solid-svg-icons';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="install-prompt" *ngIf="showInstallPrompt()">
      <div class="install-prompt-content">
        <div class="install-prompt-header">
          <div class="install-prompt-icon">
            <fa-icon [icon]="faDownload"></fa-icon>
          </div>
          <button class="close-btn" (click)="dismissPrompt()">
            <fa-icon [icon]="faTimes"></fa-icon>
          </button>
        </div>
        <div class="install-prompt-body">
          <h3>¡Instala MooMetrics!</h3>
          <p>Accede más rápido instalando la app en tu dispositivo</p>
          <div class="install-benefits">
            <div class="benefit">
              <fa-icon [icon]="faDesktop"></fa-icon>
              <span>Acceso desde escritorio</span>
            </div>
            <div class="benefit">
              <fa-icon [icon]="faMobile"></fa-icon>
              <span>Funciona sin internet</span>
            </div>
          </div>
        </div>
        <div class="install-prompt-actions">
          <button class="install-later-btn" (click)="dismissPrompt()">Más tarde</button>
          <button class="install-now-btn" (click)="installApp()">Instalar App</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .install-prompt {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      max-width: 320px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      border: 1px solid #e0e0e0;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .install-prompt-content {
      padding: 0;
    }

    .install-prompt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 16px 12px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .install-prompt-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #333, #555);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
    }

    .close-btn {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      font-size: 14px;
    }

    .close-btn:hover {
      background: #f5f5f5;
      color: #666;
    }

    .install-prompt-body {
      padding: 16px;
    }

    .install-prompt-body h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      font-family: 'Roboto', sans-serif;
    }

    .install-prompt-body p {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
      font-family: 'Roboto', sans-serif;
    }

    .install-benefits {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .benefit {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #555;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
    }

    .benefit fa-icon {
      color: #4a4a4a;
      font-size: 12px;
    }

    .install-prompt-actions {
      padding: 12px 16px 16px 16px;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .install-later-btn,
    .install-now-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Roboto', sans-serif;
    }

    .install-later-btn {
      background: #f5f5f5;
      color: #666;
    }

    .install-later-btn:hover {
      background: #e0e0e0;
    }

    .install-now-btn {
      background: #4a4a4a;
      color: #fff;
    }

    .install-now-btn:hover {
      background: #666;
    }

    @media (max-width: 768px) {
      .install-prompt {
        bottom: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
  `]
})
export class InstallPromptComponent implements OnInit, OnDestroy {
  faDownload = faDownload;
  faTimes = faTimes;
  faMobile = faMobile;
  faDesktop = faDesktop;
  
  showInstallPrompt = signal(false);

  constructor(private pwaService: PwaService) {}

  ngOnInit() {
    this.checkInstallPrompt();
  }

  ngOnDestroy() {
    // Cleanup event listeners if needed
  }

  private checkInstallPrompt() {
    // Check if app is already installed
    if (this.pwaService.isInstalled()) {
      return;
    }

    // Check if user already dismissed the prompt recently
    const dismissed = localStorage.getItem('moo_install_prompt_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysPassed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysPassed < 7) { // Don't show again for 7 days
        return;
      }
    }

    // Show prompt after a short delay
    setTimeout(() => {
      if (this.pwaService.canInstall() || this.pwaService.isIOS()) {
        this.showInstallPrompt.set(true);
      }
    }, 3000);
  }

  async installApp() {
    if (this.pwaService.canInstall()) {
      const installed = await this.pwaService.install();
      if (installed) {
        this.showInstallPrompt.set(false);
      }
    } else if (this.pwaService.isIOS()) {
      this.pwaService.showIOSInstallInstructions();
      this.showInstallPrompt.set(false);
    }
  }

  dismissPrompt() {
    this.showInstallPrompt.set(false);
    localStorage.setItem('moo_install_prompt_dismissed', Date.now().toString());
  }
}