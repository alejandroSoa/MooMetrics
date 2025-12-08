import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BiometricAuthService } from '../../services/biometric-auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faEnvelope, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-otp-verification',
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
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.css']
})
export class OtpVerificationComponent implements OnInit {
  // FontAwesome icons
  faArrowLeft = faArrowLeft;
  faEnvelope = faEnvelope;
  faShieldAlt = faShieldAlt;

  otpCode: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  userId: number | null = null;
  token: string | null = null;
  resendDisabled: boolean = true;
  resendCountdown: number = 60;
  private countdownInterval: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private biometricService: BiometricAuthService
  ) {
    console.log('OTP Component Constructor');
  }

  ngOnInit() {
    console.log('OTP Component ngOnInit');
    
    // Obtener userId y token del sessionStorage
    const userIdStr = sessionStorage.getItem('otp_user_id');
    const tempToken = sessionStorage.getItem('otp_temp_token');
    
    console.log('Session data:', { userIdStr, tempToken });
    
    if (userIdStr && tempToken) {
      this.userId = parseInt(userIdStr, 10);
      this.token = tempToken;
    } else {
      console.log('No OTP data found, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Iniciar countdown para reenvío
    this.startResendCountdown();
  }

  ngOnDestroy() {
    // Limpiar interval al destruir componente
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  onVerifyOtp() {
    if (!this.otpCode || this.otpCode.length !== 6) {
      this.errorMessage = 'Por favor ingresa un código válido de 6 dígitos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.verifyOtp(this.userId!, this.otpCode, this.token!).subscribe({
      next: (response) => {
        console.log('OTP verification successful:', response);
        if (response.status === 'success') {
          this.successMessage = 'Verificación exitosa. Redirigiendo...';
          
          // Limpiar datos temporales de sessionStorage
          sessionStorage.removeItem('otp_user_id');
          sessionStorage.removeItem('otp_temp_token');
          
          // Detectar dispositivo y redirigir
          const isMobile = this.biometricService.isMobileDevice();
          const destination = isMobile ? '/home' : '/admin';
          
          // El token ya se guarda automáticamente en el servicio
          // Redirigir después de 1 segundo
          setTimeout(() => {
            this.router.navigate([destination]);
          }, 1000);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('OTP verification failed:', error);
        this.isLoading = false;
        
        if (error.status === 400 && error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Código inválido o expirado. Intenta nuevamente.';
        }
      }
    });
  }

  onResendOtp() {
    if (this.resendDisabled) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendOtp(this.userId!).subscribe({
      next: (response) => {
        console.log('OTP resent successfully:', response);
        if (response.status === 'success') {
          this.successMessage = 'Código reenviado exitosamente. Revisa tu correo.';
          this.startResendCountdown();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Resend OTP failed:', error);
        this.isLoading = false;
        
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Error al reenviar el código. Intenta nuevamente.';
        }
      }
    });
  }

  onBackToLogin() {
    // Limpiar datos temporales
    sessionStorage.removeItem('otp_user_id');
    sessionStorage.removeItem('otp_temp_token');
    this.router.navigate(['/login']);
  }

  onOtpChange() {
    this.errorMessage = '';
    this.successMessage = '';
    
    // Auto-submit cuando se complete el código de 6 dígitos
    if (this.otpCode.length === 6) {
      this.onVerifyOtp();
    }
  }

  isFormValid(): boolean {
    return this.otpCode.length === 6;
  }

  private startResendCountdown() {
    this.resendDisabled = true;
    this.resendCountdown = 60;

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      this.resendCountdown--;
      
      if (this.resendCountdown <= 0) {
        this.resendDisabled = false;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  // Permitir solo números en el input
  onKeyPress(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
