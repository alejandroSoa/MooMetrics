import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faBell, faSearch } from '@fortawesome/free-solid-svg-icons';
import { IonApp } from '@ionic/angular/standalone';

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
  currentUrl = signal('');

  constructor(private router: Router) {}

  ngOnInit() {
    this.currentUrl.set(this.router.url);
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.url);
    });
  }

  isActive(path: string): boolean {
    const current = this.currentUrl();
    return current === path || current.startsWith(path + '/');
  }
}