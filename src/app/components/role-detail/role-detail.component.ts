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
import { RoleService, Role, RoleResponse, UpdateRoleRequest, CreateRoleRequest } from '../../services/role.service';

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
  isNewRole = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      console.log(id)
      if (id === 'new') {
        this.isNewRole = true;
        this.initializeNewRole();
      } else {
        this.roleId = +id;
        this.loadRole();
      }
    });
  }

  initializeNewRole() {
    this.isLoading = false;
    this.role = {
      id: 0,
      name: '',
      description: ''
    };
    this.originalRole = null;
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

    if (this.isNewRole) {
      // Create new role
      const createData: CreateRoleRequest = {
        name: this.role.name.trim(),
        description: this.role.description.trim()
      };

      this.roleService.createRole(createData).subscribe({
        next: (response: RoleResponse) => {
          if (response.status === 'success') {
            this.successMessage = 'Rol creado correctamente. Regresando a la lista...';
            
            // Redirect to roles list after successful creation
            setTimeout(() => {
              this.router.navigate(['/admin/roles']);
            }, 1500);
          } else {
            this.errorMessage = response.message || 'Error al crear el rol';
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error creating role:', error);
          this.errorMessage = 'Error al crear el rol';
          this.isSaving = false;
        }
      });
    } else {
      // Update existing role
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
  }

  cancelEdit() {
    if (this.isNewRole) {
      // En modo nuevo, regresar a la lista de roles
      this.router.navigate(['/admin/roles']);
    } else {
      // En modo edición, restaurar valores originales
      if (this.originalRole) {
        this.role = { ...this.originalRole };
      }
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  isFormValid(): boolean {
    return !!(this.role?.name?.trim() && this.role?.description?.trim());
  }

  hasChanges(): boolean {
    // En modo nuevo, permitir guardar si los campos están llenos
    if (this.isNewRole) {
      return this.isFormValid();
    }
    
    // En modo edición, verificar si hay cambios respecto al original
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