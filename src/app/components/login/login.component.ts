import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
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
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // FontAwesome icons
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  onLogin() {
    if (!this.email || !this.password) {
      console.error('Email y contraseña son requeridos');
      return;
    }

    this.isLoading = true;
    
    const credentials = {
      email: this.email,
      password: this.password
    };

    console.log('Login attempt:', credentials);
    
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        if (response.status === 'success') {
          // Navigate to home after successful login
          this.router.navigate(['/home']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;
        // Here you can add user-friendly error handling
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  isFormValid(): boolean {
    return !!this.email?.trim() && !!this.password?.trim();
  }
}