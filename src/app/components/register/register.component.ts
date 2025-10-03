import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton, 
    IonIcon
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  onRegister() {
    if (this.formData.password !== this.formData.confirmPassword) {
      console.error('Las contraseñas no coinciden');
      return;
    }

    // Prepare the body for the API request
    const requestBody = {
      name: `${this.formData.firstName} ${this.formData.lastName}`,
      email: this.formData.email,
      password: this.formData.password,
      roleId: 1
    };

    console.log('Register attempt:', requestBody);
    
    // Make HTTP POST request to the registration endpoint
    this.http.post('http://165.227.113.141/auth/register', requestBody)
      .subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Registration failed:', error);
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
    const isValid = !!this.formData.firstName?.trim() && 
                   !!this.formData.lastName?.trim() && 
                   !!this.formData.email?.trim() && 
                   !!this.formData.password?.trim() && 
                   !!this.formData.confirmPassword?.trim() &&
                   this.formData.password === this.formData.confirmPassword;
    
    // Debug logging to help identify the issue
    console.log('Form validation check:', {
      firstName: !!this.formData.firstName?.trim(),
      lastName: !!this.formData.lastName?.trim(),
      email: !!this.formData.email?.trim(),
      password: !!this.formData.password?.trim(),
      confirmPassword: !!this.formData.confirmPassword?.trim(),
      passwordsMatch: this.formData.password === this.formData.confirmPassword,
      isValid: isValid
    });
    
    return isValid;
  }
}