import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { StableService, Stable, StablesResponse } from '../../services/stable.service';

@Component({
  selector: 'app-stables-management',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonButtons,
    IonButton
  ],
  templateUrl: './stables-management.component.html',
  styleUrls: ['./stables-management.component.css']
})
export class StablesManagementComponent implements OnInit {
  // FontAwesome icons
  faPlus = faPlus;

  stables: Stable[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private stableService: StableService, private router: Router) {}

  ngOnInit() {
    this.loadStables();
  }

  loadStables() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.stableService.getStables().subscribe({
      next: (response: StablesResponse) => {
        if (response.status === 'success') {
          this.stables = response.data;
        } else {
          this.errorMessage = response.message || 'Error al cargar los establos';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stables:', error);
        this.errorMessage = 'Error al cargar la lista de establos';
        this.isLoading = false;
      }
    });
  }

  getStableStatusClass(isActive: boolean): string {
    return isActive ? 'stable-active' : 'stable-inactive';
  }

  getStableStatusText(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  viewStableDetail(stableId: number): void {
    this.router.navigate(['/admin/stables', stableId]);
  }

  addNewStable(): void {
    this.router.navigate(['/admin/stables/new']);
  }
}