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
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonIcon,
  IonButtons,
  IonBackButton
} from '@ionic/angular/standalone';
import { UserService, User, UserResponse, UpdateUserRequest } from '../../services/user.service';
import { RoleService, Role, RolesResponse } from '../../services/role.service';

@Component({
  selector: 'app-user-detail',
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
    IonSelect,
    IonSelectOption,
    IonButton,
    IonSpinner,
    IonIcon,
    IonButtons,
    IonBackButton
  ],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  originalUser: User | null = null;
  roles: Role[] = [];
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  userId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.loadUser();
      this.loadRoles();
    });
  }

  loadUser() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userService.getUserById(this.userId).subscribe({
      next: (response: UserResponse) => {
        if (response.status === 'success') {
          this.user = { ...response.data };
          this.originalUser = { ...response.data };
        } else {
          this.errorMessage = response.message || 'Error al cargar el usuario';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.errorMessage = 'Error al cargar los detalles del usuario';
        this.isLoading = false;
      }
    });
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (response: RolesResponse) => {
        if (response.status === 'success') {
          this.roles = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  saveUser() {
    if (!this.user || !this.isFormValid()) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData: UpdateUserRequest = {
      name: this.user.name.trim(),
      email: this.user.email.trim(),
      roleId: this.user.roleId
    };

    this.userService.updateUser(this.userId, updateData).subscribe({
      next: (response: UserResponse) => {
        if (response.status === 'success') {
          this.successMessage = 'Usuario actualizado correctamente. Regresando a la lista...';
          this.originalUser = { ...response.data };
          this.user = { ...response.data };
          
          // Redirect to users list after successful update
          setTimeout(() => {
            this.router.navigate(['/admin/users']);
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Error al actualizar el usuario';
        }
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.errorMessage = 'Error al actualizar el usuario';
        this.isSaving = false;
      }
    });
  }

  cancelEdit() {
    if (this.originalUser) {
      this.user = { ...this.originalUser };
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  isFormValid(): boolean {
    return !!(this.user?.name?.trim() && this.user?.email?.trim() && this.user?.roleId);
  }

  hasChanges(): boolean {
    if (!this.user || !this.originalUser) return false;
    
    return this.user.name.trim() !== this.originalUser.name.trim() ||
           this.user.email.trim() !== this.originalUser.email.trim() ||
           this.user.roleId !== this.originalUser.roleId;
  }

  goBack() {
    this.router.navigate(['/admin/users']);
  }

  getRoleTypeClass(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    if (!role) return 'role-default';
    
    switch (role.name.toLowerCase()) {
      case 'admin': return 'role-admin';
      case 'dev': return 'role-dev';
      case 'user': return 'role-user';
      default: return 'role-default';
    }
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    if (!role) return 'Desconocido';
    
    switch (role.name.toLowerCase()) {
      case 'admin': return 'Administrador';
      case 'dev': return 'Desarrollador';
      case 'user': return 'Usuario';
      default: return role.name;
    }
  }
}