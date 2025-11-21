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
  biometricError: boolean = false;

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
    // Verificar disponibilidad de WebAuthn
    const isWebAuthnAvailable = await this.biometricService.isBiometricAvailable();
    
    if (isWebAuthnAvailable) {
      // En móvil: solo mostrar si es realmente biométrico (huella/face)
      // En desktop: mostrar clave de acceso
      if (this.biometricService.isMobileDevice()) {
        // Para móvil, verificar que tenga sensor biométrico real
        this.isBiometricAvailable = await this.checkMobileBiometric();
      } else {
        // Para desktop, permitir clave de acceso
        this.isBiometricAvailable = true;
      }
      
      if (this.isBiometricAvailable) {
        this.hasBiometricCredentials = this.biometricService.hasBiometricCredentials();
      }
    }
  }

  /**
   * Verifica si el dispositivo móvil tiene biométrica real disponible
   */
  private async checkMobileBiometric(): Promise<boolean> {
    try {
      // Intentar crear una credencial de prueba para verificar biométrica
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      const createCredentialOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: challenge,
          rp: { name: 'Test', id: window.location.hostname },
          user: {
            id: new TextEncoder().encode('test'),
            name: 'test',
            displayName: 'test'
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          },
          timeout: 10000
        }
      };
      
      // Solo verificar disponibilidad, no crear realmente
      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return isAvailable;
    } catch {
      return false;
    }
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
    this.biometricError = false;

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
        this.biometricError = true;
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      this.biometricError = true;
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

  /**
   * Obtiene el texto del botón biométrico según el dispositivo
   */
  getBiometricButtonText(): string {
    if (this.biometricService.isMobileDevice()) {
      return 'Iniciar con Huella';
    } else {
      return 'Iniciar con Clave de Acceso';
    }
  }

  /**
   * Obtiene el texto de configuración biométrica según el dispositivo
   */
  getBiometricSetupText(): string {
    if (this.biometricService.isMobileDevice()) {
      return 'Activar acceso con huella';
    } else {
      return 'Activar clave de acceso';
    }
  }

  /**
   * Verifica si debe mostrar la opción biométrica
   */
  shouldShowBiometric(): boolean {
    // En móvil: solo mostrar si hay biométrica real disponible
    // En desktop: mostrar clave de acceso si está disponible
    return this.isBiometricAvailable && (
      !this.biometricService.isMobileDevice() || 
      this.biometricService.isMobileDevice()
    );
  }

  /**
   * Elimina las credenciales biométricas antiguas y permite registrar nuevas
   */
  async removeOldBiometric(): Promise<void> {
    try {
      // Eliminar credenciales almacenadas
      this.biometricService.removeBiometricCredentials();
      
      // Resetear estado
      this.hasBiometricCredentials = false;
      this.biometricError = false;
      
      console.log('Old biometric credentials removed');
      
      // Si hay email, ofrecer registrar nueva huella inmediatamente
      if (this.email) {
        setTimeout(() => {
          this.registerBiometric();
        }, 500);
      }
    } catch (error) {
      console.error('Error removing old biometric credentials:', error);
    }
  }
}