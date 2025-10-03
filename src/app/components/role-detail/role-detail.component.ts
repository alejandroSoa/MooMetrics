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
  IonTextarea,
  IonButton,
  IonSpinner,
  IonIcon,
  IonButtons,
  IonBackButton
} from '@ionic/angular/standalone';
import { RoleService, Role, RoleResponse, UpdateRoleRequest } from '../../services/role.service';

@Component({
  selector: 'app-role-detail',
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
    IonTextarea,
    IonButton,
    IonSpinner,
    IonButtons,
    IonBackButton
  ],
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.css']
})
export class RoleDetailComponent implements OnInit {
  role: Role | null = null;
  originalRole: Role | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  roleId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.roleId = +params['id'];
      this.loadRole();
    });
  }

  loadRole() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.roleService.getRoleById(this.roleId).subscribe({
      next: (response: RoleResponse) => {
        if (response.status === 'success') {
          this.role = { ...response.data };
          this.originalRole = { ...response.data };
        } else {
          this.errorMessage = response.message || 'Error al cargar el rol';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading role:', error);
        this.errorMessage = 'Error al cargar los detalles del rol';
        this.isLoading = false;
      }
    });
  }

  saveRole() {
    if (!this.role || !this.isFormValid()) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData: UpdateRoleRequest = {
      name: this.role.name.trim(),
      description: this.role.description.trim()
    };

    this.roleService.updateRole(this.roleId, updateData).subscribe({
      next: (response: RoleResponse) => {
        if (response.status === 'success') {
          this.successMessage = 'Rol actualizado correctamente. Regresando a la lista...';
          this.originalRole = { ...response.data };
          this.role = { ...response.data };
          
          // Redirect to roles list after successful update
          setTimeout(() => {
            this.router.navigate(['/admin/roles']);
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Error al actualizar el rol';
        }
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.errorMessage = 'Error al actualizar el rol';
        this.isSaving = false;
      }
    });
  }

  cancelEdit() {
    if (this.originalRole) {
      this.role = { ...this.originalRole };
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  isFormValid(): boolean {
    return !!(this.role?.name?.trim() && this.role?.description?.trim());
  }

  hasChanges(): boolean {
    if (!this.role || !this.originalRole) return false;
    
    return this.role.name.trim() !== this.originalRole.name.trim() ||
           this.role.description.trim() !== this.originalRole.description.trim();
  }

  goBack() {
    this.router.navigate(['/admin/roles']);
  }

  getRoleTypeClass(roleName: string): string {
    switch (roleName?.toLowerCase()) {
      case 'admin': return 'role-admin';
      case 'dev': return 'role-dev';
      case 'user': return 'role-user';
      default: return 'role-default';
    }
  }
}