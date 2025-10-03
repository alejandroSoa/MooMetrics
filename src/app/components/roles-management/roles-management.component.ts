import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  IonBadge
} from '@ionic/angular/standalone';
import { RoleService, Role, RolesResponse } from '../../services/role.service';

@Component({
  selector: 'app-roles-management',
  standalone: true,
  imports: [
    CommonModule,
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
    IonBadge
  ],
  templateUrl: './roles-management.component.html',
  styleUrls: ['./roles-management.component.css']
})
export class RolesManagementComponent implements OnInit {
  roles: Role[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private roleService: RoleService, private router: Router) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.roleService.getRoles().subscribe({
      next: (response: RolesResponse) => {
        if (response.status === 'success') {
          this.roles = response.data;
        } else {
          this.errorMessage = response.message || 'Error al cargar roles';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.errorMessage = 'Error al cargar la lista de roles';
        this.isLoading = false;
      }
    });
  }

  getRoleTypeClass(roleName: string): string {
    switch (roleName.toLowerCase()) {
      case 'admin': return 'role-admin';
      case 'dev': return 'role-dev';
      case 'user': return 'role-user';
      default: return 'role-default';
    }
  }

  getRoleDisplayName(roleName: string): string {
    switch (roleName.toLowerCase()) {
      case 'admin': return 'Administrador';
      case 'dev': return 'Desarrollador';
      case 'user': return 'Usuario';
      default: return roleName;
    }
  }

  viewRoleDetail(roleId: number): void {
    this.router.navigate(['/admin/roles', roleId]);
  }
}