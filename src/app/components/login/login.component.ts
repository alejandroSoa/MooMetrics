import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BiometricAuthService } from '../../services/biometric-auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash, faFingerprint } from '@fortawesome/free-solid-svg-icons';
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
  selector: 'app-login',
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
  errorMessage: string = '';
  
  // reCAPTCHA
  siteKey: string = '6LeNzSIsAAAAANjP4ywamhPNAu-BaNC9xOjlPUv9';
  recaptchaToken: string | null = null;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private biometricService: BiometricAuthService
  ) {
    this.initializeBiometric();
  }

  onRecaptchaResolved(token: string | null) {
    this.recaptchaToken = token;
    console.log('reCAPTCHA token:', token);
  }

  onLogin() {
    if (!this.email || !this.password) {
      console.error('Email y contraseña son requeridos');
      return;
    }

    if (!this.recaptchaToken) {
      this.errorMessage = 'Por favor completa el reCAPTCHA';
      return;
    }

    this.isLoading = true;
    this.errorMessage = ''; // Clear previous error message
    
    const credentials = {
      email: this.email,
      password: this.password
    };

    console.log('Login attempt:', credentials);
    
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        console.log('OTP required?', response.data.otpSent);
        console.log('User ID:', response.data.userId);
        
        if (response.status === 'success') {
          // Verificar si se requiere OTP
          if (response.data.otpSent && response.data.userId) {
            console.log('Redirecting to OTP verification...');
            // Guardar datos temporalmente en sessionStorage
            sessionStorage.setItem('otp_user_id', response.data.userId.toString());
            sessionStorage.setItem('otp_temp_token', response.data.token);
            
            // Redirigir a la pantalla de verificación OTP
            this.router.navigate(['/otp-verification']);
          } else {
            // Guardar credenciales para uso con huella digital
            this.saveUserCredentials(this.email, this.password);
            
            // Detectar dispositivo y redirigir
            const isMobile = this.biometricService.isMobileDevice();
            const destination = isMobile ? '/home' : '/admin';
            this.router.navigate([destination]);
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;
        
        // Check if it's a 401 error and extract the message
        if (error.status === 401 && error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Error de autenticación. Verifica tus credenciales.';
        }
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
    return !!this.email?.trim() && !!this.password?.trim() && !!this.recaptchaToken;
  }

  onEmailChange() {
    this.errorMessage = ''; // Clear error when user types
  }

  onPasswordChange() {
    this.errorMessage = ''; // Clear error when user types
  }

  resetRecaptcha() {
    this.recaptchaToken = null;
  }

  /**
   * Inicializa la configuración biométrica
   */
  private async initializeBiometric(): Promise<void> {
    // Verificar primero si es realmente un dispositivo móvil
    const isMobile = this.biometricService.isMobileDevice();
    console.log('Is mobile device:', isMobile);
    
    if (!isMobile) {
      this.isBiometricAvailable = false;
      console.log('Biometric disabled: Not a mobile device');
      return;
    }

    // Verificar disponibilidad de WebAuthn en móvil
    const isWebAuthnAvailable = await this.biometricService.isBiometricAvailable();
    
    if (isWebAuthnAvailable) {
      this.isBiometricAvailable = true;
      this.hasBiometricCredentials = this.biometricService.hasBiometricCredentials();
      
      // Verificar que también tengamos credenciales de usuario guardadas
      const savedCredentials = this.getSavedUserCredentials();
      if (this.hasBiometricCredentials && !savedCredentials) {
        console.log('Biometric credentials exist but no user credentials found');
        // Resetear credenciales biométricas si no hay credenciales de usuario
        this.biometricService.removeBiometricCredentials();
        this.hasBiometricCredentials = false;
      }
      
      console.log('Biometric available:', this.isBiometricAvailable, 'Has credentials:', this.hasBiometricCredentials);
    } else {
      this.isBiometricAvailable = false;
      console.log('Biometric disabled: WebAuthn not available');
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
        
        // Obtener credenciales guardadas y hacer login automático
        const savedCredentials = this.getSavedUserCredentials();
        if (savedCredentials) {
          console.log('Using saved credentials for automatic login');
          
          // Hacer login automático con credenciales guardadas
          // Agregar skipOtp: true para omitir validación OTP en login biométrico
          const biometricCredentials = { ...savedCredentials, skipOtp: true };
          
          this.authService.login(biometricCredentials).subscribe({
            next: (response) => {
              console.log('Automatic biometric login successful:', response);
              if (response.status === 'success') {
                // Login biométrico siempre es directo, sin OTP
                console.log('Biometric login bypassing OTP, going to home');
                this.router.navigate(['/home']);
              } else {
                console.error('Automatic login failed, removing saved credentials');
                this.removeSavedUserCredentials();
                this.biometricError = true;
              }
              this.isBiometricLoading = false;
            },
            error: (error) => {
              console.error('Automatic login error:', error);
              // Si falla el login automático, las credenciales pueden estar obsoletas
              this.removeSavedUserCredentials();
              this.biometricError = true;
              this.isBiometricLoading = false;
            }
          });
        } else {
          console.error('No saved credentials found');
          this.biometricError = true;
          this.isBiometricLoading = false;
        }
      } else {
        console.error('Biometric authentication failed');
        this.biometricError = true;
        this.isBiometricLoading = false;
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      this.biometricError = true;
      this.isBiometricLoading = false;
    }
  }

  /**
   * Registra credenciales biométricas después del login tradicional
   */
  async registerBiometric(): Promise<void> {
    if (!this.email || !this.password || !this.isBiometricAvailable) {
      console.log('Cannot register biometric:', { 
        email: this.email, 
        password: !!this.password, 
        available: this.isBiometricAvailable 
      });
      return;
    }

    console.log('Attempting to register biometric for:', this.email);
    
    try {
      const success = await this.biometricService.registerBiometric(this.email, this.email);
      if (success) {
        console.log('Biometric registration successful');
        
        // Guardar credenciales para uso futuro con huella
        this.saveUserCredentials(this.email, this.password);
        
        this.hasBiometricCredentials = true;
      } else {
        console.log('Biometric registration failed');
      }
    } catch (error) {
      console.error('Error registering biometric:', error);
    }
  }

  /**
   * Obtiene el texto del botón biométrico (solo para móviles)
   */
  getBiometricButtonText(): string {
    return 'Iniciar con Huella';
  }

  /**
   * Obtiene el texto de configuración biométrica (solo para móviles)
   */
  getBiometricSetupText(): string {
    return 'Activar acceso con huella';
  }

  /**
   * Verifica si debe mostrar la opción biométrica (solo móviles reales)
   */
  shouldShowBiometric(): boolean {
    // Doble verificación: tanto la disponibilidad como que sea realmente móvil
    const isMobile = this.biometricService.isMobileDevice();
    const shouldShow = this.isBiometricAvailable && isMobile;
    
    if (!shouldShow) {
      console.log('Biometric button hidden:', { 
        available: this.isBiometricAvailable, 
        mobile: isMobile 
      });
    }
    
    return shouldShow;
  }



  /**
   * Guarda las credenciales del usuario para uso con autenticación biométrica
   */
  private saveUserCredentials(email: string, password: string): void {
    try {
      const credentials = {
        email: email,
        password: password,
        timestamp: Date.now()
      };
      
      // Encriptar básicamente las credenciales (base64)
      const encodedCredentials = btoa(JSON.stringify(credentials));
      localStorage.setItem('moo_user_credentials', encodedCredentials);
      
      console.log('User credentials saved for biometric use');
    } catch (error) {
      console.error('Error saving user credentials:', error);
    }
  }

  /**
   * Obtiene las credenciales guardadas del usuario
   */
  private getSavedUserCredentials(): {email: string, password: string} | null {
    try {
      const encodedCredentials = localStorage.getItem('moo_user_credentials');
      if (!encodedCredentials) {
        return null;
      }
      
      const credentials = JSON.parse(atob(encodedCredentials));
      
      // Verificar que las credenciales no sean muy antiguas (30 días)
      const daysSinceSaved = (Date.now() - credentials.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceSaved > 30) {
        console.log('Saved credentials are too old, removing');
        this.removeSavedUserCredentials();
        return null;
      }
      
      return {
        email: credentials.email,
        password: credentials.password
      };
    } catch (error) {
      console.error('Error retrieving saved credentials:', error);
      return null;
    }
  }

  /**
   * Elimina las credenciales guardadas del usuario
   */
  private removeSavedUserCredentials(): void {
    localStorage.removeItem('moo_user_credentials');
    console.log('Saved user credentials removed');
  }
}