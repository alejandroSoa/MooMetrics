import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faBell, faSearch, faUserShield, faToggleOn, faToggleOff, faChartLine, faUserTag, faArrowRightFromBracket, faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { IonApp, IonToggle } from '@ionic/angular/standalone';
import { AdminModeService } from './services/admin-mode.service';
import { InstallPromptComponent } from './components/install-prompt/install-prompt.component';
import { FmcService } from './services/fmc.service';

@Component({
  selector: 'app-root',
  imports: [IonApp, CommonModule, FormsModule, FontAwesomeModule, RouterModule, InstallPromptComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'MooMetrics';
  faUsers = faUsers;
  faBell = faBell;
  faUserShield = faUserShield;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;
  faChartLine = faChartLine;
  faUserTag = faUserTag;
  faWarehouse = faWarehouse;
  faArrowRightFromBracket = faArrowRightFromBracket;
  currentUrl = signal('');
  isAdminMode = signal(false);
  showLogoutConfirm = signal(false);
  private previousAdminMode: boolean | null = null;
  constructor(
    private router: Router,
    private adminModeService: AdminModeService,
    private fmcService: FmcService
  ) {}

  ngOnInit() {
    this.currentUrl.set(this.router.url);
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.url);
    });

    // Subscribe to admin mode changes and handle navigation
    this.adminModeService.getAdminModeStatus().subscribe(isAdmin => {
      const wasAdminMode = this.previousAdminMode;
      this.isAdminMode.set(isAdmin);
      
      // Only redirect if this is a change (not initial load)
      if (wasAdminMode !== null && wasAdminMode !== isAdmin) {
        if (isAdmin) {
          // Admin mode activated - redirect to admin
          this.router.navigate(['/admin']);
        } else {
          // Admin mode deactivated - redirect to home
          this.router.navigate(['/home']);
        }
      }
      
      // Update previous state
      this.previousAdminMode = isAdmin;
    });

    this.fmcService.installFCMServiceWorker();
  }

  isActive(path: string): boolean {
    const current = this.currentUrl();
    return current === path || current.startsWith(path + '/');
  }

  isExactActive(path: string): boolean {
    const current = this.currentUrl();
    return current === path;
  }

  isAuthPage(): boolean {
    const current = this.currentUrl();
    return current === '/login' || current === '/register';
  }

  toggleAdminMode(): void {
    this.adminModeService.toggleAdminMode();
  }

  showLogoutConfirmation(): void {
    this.showLogoutConfirm.set(true);
  }

  confirmLogout(): void {
    localStorage.removeItem('moo_auth_token');
    this.router.navigate(['/login']);
    this.showLogoutConfirm.set(false);
  }

  cancelLogout(): void {
    this.showLogoutConfirm.set(false);
  }
}