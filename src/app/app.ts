import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faBell, faSearch, faUserShield, faToggleOn, faToggleOff, faChartLine, faUserTag } from '@fortawesome/free-solid-svg-icons';
import { IonApp, IonToggle } from '@ionic/angular/standalone';
import { AdminModeService } from './services/admin-mode.service';

@Component({
  selector: 'app-root',
  imports: [IonApp, CommonModule, FormsModule, FontAwesomeModule, RouterModule],
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
  currentUrl = signal('');
  isAdminMode = signal(false);

  constructor(private router: Router, private adminModeService: AdminModeService) {}

  ngOnInit() {
    this.currentUrl.set(this.router.url);
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.url);
    });

    // Subscribe to admin mode changes
    this.adminModeService.getAdminModeStatus().subscribe(isAdmin => {
      this.isAdminMode.set(isAdmin);
    });
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
}