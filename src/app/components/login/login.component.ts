import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BiometricAuthService } from '../../services/biometric-auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash, faFingerprint } from '@fortawesome/free-solid-svg-icons';
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
  faFingerprint = faFingerprint;

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  isBiometricLoading: boolean = false;
  isBiometricAvailable: boolean = false;
  hasBiometricCredentials: boolean = false;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private biometricService: BiometricAuthService
  ) {
    this.initializeBiometric();
  }

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

  /**
   * Inicializa la configuración biométrica
   */
  private async initializeBiometric(): Promise<void> {
    this.isBiometricAvailable = await this.biometricService.isBiometricAvailable();
    this.hasBiometricCredentials = this.biometricService.hasBiometricCredentials();
  }

  /**
   * Autentica usando biométrica
   */
  async onBiometricLogin(): Promise<void> {
    if (!this.isBiometricAvailable) {
      console.error('Biometric authentication not available');
      return;
    }

    this.isBiometricLoading = true;

    try {
      const success = await this.biometricService.authenticateWithBiometric();
      if (success) {
        console.log('Biometric authentication successful');
        // Simular login exitoso sin necesidad de backend
        const mockToken = 'biometric_token_' + Date.now();
        localStorage.setItem('moo_auth_token', mockToken);
        this.router.navigate(['/home']);
      } else {
        console.error('Biometric authentication failed');
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
    } finally {
      this.isBiometricLoading = false;
    }
  }

  /**
   * Registra credenciales biométricas después del login tradicional
   */
  async registerBiometric(): Promise<void> {
    if (!this.email || !this.isBiometricAvailable) {
      return;
    }

    try {
      const success = await this.biometricService.registerBiometric(this.email, this.email);
      if (success) {
        console.log('Biometric registration successful');
        this.hasBiometricCredentials = true;
      }
    } catch (error) {
      console.error('Error registering biometric:', error);
    }
  }
}