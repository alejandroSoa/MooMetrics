import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  IonInput,
  IonButton,
  IonSpinner,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonToggle
} from '@ionic/angular/standalone';
import { StableService, Stable, StableResponse, UpdateStableRequest, CreateStableRequest } from '../../services/stable.service';

@Component({
  selector: 'app-stable-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonInput,
    IonButton,
    IonSpinner,
    IonButtons,
    IonBackButton,
    IonToggle
  ],
  templateUrl: './stable-detail.component.html',
  styleUrls: ['./stable-detail.component.css']
})
export class StableDetailComponent implements OnInit {
  stable: Stable | null = null;
  originalStable: Stable | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  stableId: number = 0;
  isNewStable = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stableService: StableService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id === 'new') {
        this.isNewStable = true;
        this.initializeNewStable();
      } else {
        this.isNewStable = false;
        this.stableId = +id;
        this.loadStable();
      }
    });
  }

  initializeNewStable() {
    this.isLoading = false;
    this.stable = {
      id: 0,
      name: '',
      isActive: true
    };
    this.originalStable = null;
  }

  loadStable() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.stableService.getStableById(this.stableId).subscribe({
      next: (response: StableResponse) => {
        if (response.status === 'success') {
          this.stable = { ...response.data };
          this.originalStable = { ...response.data };
        } else {
          this.errorMessage = response.message || 'Error al cargar el establo';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stable:', error);
        this.errorMessage = 'Error al cargar los detalles del establo';
        this.isLoading = false;
      }
    });
  }

  saveStable() {
    if (!this.stable || !this.isFormValid()) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isNewStable) {
      // Create new stable
      const createData: CreateStableRequest = {
        name: this.stable.name.trim(),
        isActive: this.stable.isActive
      };

      this.stableService.createStable(createData).subscribe({
        next: (response: StableResponse) => {
          if (response.status === 'success') {
            this.successMessage = 'Establo creado correctamente. Regresando a la lista...';
            
            // Redirect to stables list after successful creation
            setTimeout(() => {
              this.router.navigate(['/admin/stables']);
            }, 1500);
          } else {
            this.errorMessage = response.message || 'Error al crear el establo';
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error creating stable:', error);
          this.errorMessage = 'Error al crear el establo';
          this.isSaving = false;
        }
      });
    } else {
      // Update existing stable
      const updateData: UpdateStableRequest = {
        name: this.stable.name.trim(),
        isActive: this.stable.isActive
      };

      this.stableService.updateStable(this.stableId, updateData).subscribe({
        next: (response: StableResponse) => {
          if (response.status === 'success') {
            this.successMessage = 'Establo actualizado correctamente. Regresando a la lista...';
            this.originalStable = { ...response.data };
            this.stable = { ...response.data };
            
            // Redirect to stables list after successful update
            setTimeout(() => {
              this.router.navigate(['/admin/stables']);
            }, 1500);
          } else {
            this.errorMessage = response.message || 'Error al actualizar el establo';
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error updating stable:', error);
          this.errorMessage = 'Error al actualizar el establo';
          this.isSaving = false;
        }
      });
    }
  }

  cancelEdit() {
    if (this.isNewStable) {
      // En modo nuevo, regresar a la lista de establos
      this.router.navigate(['/admin/stables']);
    } else {
      // En modo edición, restaurar valores originales
      if (this.originalStable) {
        this.stable = { ...this.originalStable };
      }
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  isFormValid(): boolean {
    return !!(this.stable?.name?.trim());
  }

  hasChanges(): boolean {
    // En modo nuevo, permitir guardar si los campos están llenos
    if (this.isNewStable) {
      return this.isFormValid();
    }
    
    // En modo edición, verificar si hay cambios respecto al original
    if (!this.stable || !this.originalStable) return false;
    
    return this.stable.name.trim() !== this.originalStable.name.trim() ||
           this.stable.isActive !== this.originalStable.isActive;
  }

  goBack() {
    this.router.navigate(['/admin/stables']);
  }

  getStableStatusText(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }
}