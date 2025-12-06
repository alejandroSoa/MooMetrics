import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { faEye, faEyeSlash, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';

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
    RecaptchaModule,
    RecaptchaFormsModule,
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
  errorMessage: string = '';
  
  // reCAPTCHA
  siteKey: string = '6LeNzSIsAAAAANjP4ywamhPNAu-BaNC9xOjlPUv9';
  recaptchaToken: string | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  onRecaptchaResolved(token: string | null) {
    this.recaptchaToken = token;
    console.log('reCAPTCHA token:', token);
  }

  onRegister() {
    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (!this.recaptchaToken) {
      this.errorMessage = 'Por favor completa el reCAPTCHA';
      return;
    }

    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

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
          // Extract error message from response
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Error al crear la cuenta. Intenta nuevamente.';
          }
          // Reset recaptcha token on error to allow retry
          this.recaptchaToken = null;
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onInputChange() {
    this.errorMessage = ''; // Clear error when user types
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