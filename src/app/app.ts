import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faBell, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, FontAwesomeModule, RouterModule],

  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'MooMetrics';
  faUsers = faUsers;
  faBell = faBell;

  constructor(private router: Router) {}

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }
}