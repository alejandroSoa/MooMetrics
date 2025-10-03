import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  acceptTerms: boolean = false;

  constructor(private router: Router) {}

  onRegister() {
    if (this.formData.password !== this.formData.confirmPassword) {
      console.error('Las contraseñas no coinciden');
      return;
    }
    
    if (!this.acceptTerms) {
      console.error('Debes aceptar los términos y condiciones');
      return;
    }

    // Por ahora solo navegamos al home, aquí irá la lógica de registro
    console.log('Register attempt:', this.formData);
    this.router.navigate(['/home']);
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
    return !!this.formData.firstName && 
           !!this.formData.lastName && 
           !!this.formData.email && 
           !!this.formData.password && 
           !!this.formData.confirmPassword &&
           this.formData.password === this.formData.confirmPassword &&
           this.acceptTerms;
  }
}