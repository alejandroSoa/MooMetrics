import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonSpinner,
  IonBadge,
  IonProgressBar
} from '@ionic/angular/standalone';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDatabase, faCalendarAlt, faPlay, faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { StableService, Stable, StablesResponse } from '../../services/stable.service';
import { DataGeneratorService } from '../../services/data-generator.service';

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonButton,
    IonSpinner,
    IonBadge,
    IonProgressBar
  ],
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit {
  // FontAwesome icons
  faDatabase = faDatabase;
  faCalendarAlt = faCalendarAlt;
  faPlay = faPlay;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faSpinner = faSpinner;

  // Stables data
  stables: Stable[] = [];
  selectedStableId: number | null = null;
  isLoadingStables = false;
  stablesError = '';

  // Date range
  startDate: string = '';
  endDate: string = '';

  // Data insertion process
  isProcessing = false;
  currentStep: 'idle' | 'inventory' | 'events' | 'completed' = 'idle';
  inventoryResult: any = null;
  eventsResult: any = null;
  processError = '';
  showResults = false;

  constructor(
    private stableService: StableService,
    private dataGeneratorService: DataGeneratorService
  ) {
    // Set default dates (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = lastDay.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.loadStables();
  }

  /**
   * Load available stables
   */
  loadStables() {
    this.isLoadingStables = true;
    this.stablesError = '';
    
    this.stableService.getStables().subscribe({
      next: (response: StablesResponse) => {
        if (response.status === 'success') {
          this.stables = response.data.filter(stable => stable.isActive);
        } else {
          this.stablesError = response.message || 'Error al cargar los establos';
        }
        this.isLoadingStables = false;
      },
      error: (error) => {
        console.error('Error loading stables:', error);
        this.stablesError = 'Error al cargar la lista de establos';
        this.isLoadingStables = false;
      }
    });
  }

  /**
   * Get selected stable object
   */
  getSelectedStable(): Stable | null {
    if (!this.selectedStableId) return null;
    return this.stables.find(stable => stable.id === this.selectedStableId) || null;
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return !!this.selectedStableId && !!this.startDate && !!this.endDate && this.startDate <= this.endDate;
  }

  /**
   * Process data insertion following the required flow
   */
  processDataInsertion() {
    if (!this.isFormValid()) {
      return;
    }

    this.isProcessing = true;
    this.currentStep = 'inventory';
    this.inventoryResult = null;
    this.eventsResult = null;
    this.processError = '';
    this.showResults = false;

    const selectedStable = this.getSelectedStable();
    if (!selectedStable) return;

    this.dataGeneratorService.processDataInsertion(
      selectedStable.id,
      this.startDate,
      this.endDate
    ).subscribe({
      next: (result) => {
        this.inventoryResult = result.inventory;
        this.eventsResult = result.events;
        
        if (result.success) {
          this.currentStep = 'completed';
        } else {
          this.currentStep = 'idle';
          if (result.inventory.status === 'error') {
            this.processError = result.inventory.message;
          } else if (result.events.status === 'error') {
            this.processError = result.events.message;
          }
        }
        
        this.isProcessing = false;
        this.showResults = true;
      },
      error: (error) => {
        console.error('Error in data insertion process:', error);
        this.processError = 'Error inesperado durante el proceso de inserción';
        this.currentStep = 'idle';
        this.isProcessing = false;
        this.showResults = true;
      }
    });
  }

  /**
   * Reset the form and results
   */
  resetForm() {
    this.selectedStableId = null;
    this.currentStep = 'idle';
    this.inventoryResult = null;
    this.eventsResult = null;
    this.processError = '';
    this.showResults = false;
    
    // Reset dates to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = lastDay.toISOString().split('T')[0];
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: 'success' | 'error'): string {
    return status === 'success' ? 'status-success' : 'status-error';
  }

  /**
   * Get current step status
   */
  getStepStatus(step: 'inventory' | 'events'): 'pending' | 'processing' | 'success' | 'error' {
    if (!this.showResults && !this.isProcessing) {
      return 'pending';
    }

    if (this.isProcessing) {
      if (step === 'inventory' && this.currentStep === 'inventory') {
        return 'processing';
      }
      if (step === 'events' && this.currentStep === 'events') {
        return 'processing';
      }
      if (step === 'events' && this.currentStep === 'inventory') {
        return 'pending';
      }
    }

    if (step === 'inventory' && this.inventoryResult) {
      return this.inventoryResult.status === 'success' ? 'success' : 'error';
    }

    if (step === 'events' && this.eventsResult) {
      return this.eventsResult.status === 'success' ? 'success' : 'error';
    }

    return 'pending';
  }
}