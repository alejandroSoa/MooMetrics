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
  ViewWillEnter
} from '@ionic/angular/standalone';
import { UserService, User, UsersResponse } from '../../services/user.service';

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
export class UsersManagementComponent implements OnInit, ViewWillEnter {
  users: User[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    // Initial load is handled by ionViewWillEnter
  }

  ionViewWillEnter() {
    // This lifecycle hook is called every time the view is entered
    // This ensures the list is refreshed when returning from user-detail
    this.loadUsers();
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

  getRoleName(roleId: number): string {
    switch (roleId) {
      case 1: return 'Usuario';
      case 2: return 'Moderador';
      case 3: return 'Administrador';
      default: return 'Desconocido';
    }
  }

  viewUserDetail(userId: number): void {
    this.router.navigate(['/admin/users', userId]);
  }
}