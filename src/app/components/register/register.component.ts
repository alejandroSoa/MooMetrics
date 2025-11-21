import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { faEye, faEyeSlash, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonIcon 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    FontAwesomeModule,
    IonContent, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // FontAwesome icons
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  onRegister() {
    if (this.formData.password !== this.formData.confirmPassword) {
      return;
    }

    if (!this.isFormValid()) {
      return;
    }

    this.isLoading = true;

    // Prepare the body for the API request
    const requestBody: RegisterRequest = {
      name: `${this.formData.firstName} ${this.formData.lastName}`,
      email: this.formData.email,
      password: this.formData.password,
      roleId: 1
    };
    
    // Use AuthService for registration
    this.authService.register(requestBody)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          // Navigate to login after successful registration
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          // Here you can add user-friendly error handling
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  isFormValid(): boolean {
    return !!this.formData.firstName?.trim() && 
           !!this.formData.lastName?.trim() && 
           !!this.formData.email?.trim() && 
           !!this.formData.password?.trim() && 
           !!this.formData.confirmPassword?.trim() &&
           this.formData.password === this.formData.confirmPassword;
  }
}