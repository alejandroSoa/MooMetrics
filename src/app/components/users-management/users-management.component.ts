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
  IonCardContent 
} from '@ionic/angular/standalone';
import { UserService, User, UsersResponse } from '../../services/user.service';
import { RoleService, Role, RolesResponse } from '../../services/role.service';

@Component({
  selector: 'app-users-management',
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
    IonCardContent
  ],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css']
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userService.getUsers().subscribe({
      next: (response: UsersResponse) => {
        if (response.status === 'success') {
          this.users = response.data;
        } else {
          this.errorMessage = response.message || 'Error al cargar usuarios';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Error al cargar la lista de usuarios';
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

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    if (!role) return 'Desconocido';
    
    // Mapeo de nombres de rol a español
    const roleNameMap: { [key: string]: string } = {
      'admin': 'Administrador',
      'dev': 'Desarrollador',
      'user': 'Usuario',
      'moderador': 'Moderador',
      'moderator': 'Moderador'
    };
    
    const normalizedName = role.name.toLowerCase();
    return roleNameMap[normalizedName] || role.name;
  }

  viewUserDetail(userId: number): void {
    this.router.navigate(['/admin/users', userId]);
  }
}