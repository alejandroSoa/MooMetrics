import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';

export interface BiometricCredential {
  id: string;
  rawId: ArrayBuffer;
  response: AuthenticatorAttestationResponse;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class BiometricAuthService {
  private readonly CREDENTIAL_KEY = 'biometric_credentials';
  private isBiometricAvailableSubject = new BehaviorSubject<boolean>(false);
  public isBiometricAvailable$ = this.isBiometricAvailableSubject.asObservable();

  constructor() {
    this.checkBiometricAvailability();
  }

  /**
   * Verifica si la autenticación biométrica está disponible
   */
  private async checkBiometricAvailability(): Promise<void> {
    try {
      // Verificar si WebAuthn está disponible
      const isAvailable = window.PublicKeyCredential && 
                         await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      this.isBiometricAvailableSubject.next(isAvailable);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      this.isBiometricAvailableSubject.next(false);
    }
  }

  /**
   * Registra una nueva credencial biométrica
   */
  async registerBiometric(userId: string, userName: string): Promise<boolean> {
    try {
      if (!await this.isBiometricAvailable()) {
        throw new Error('Biometric authentication not available');
      }

      // Generar un challenge único
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Configuración para crear credencial
      const createCredentialOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: challenge,
          rp: {
            name: 'MooMetrics',
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userName,
            displayName: userName
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Para usar biométrica del dispositivo
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'direct'
        }
      };

      // Crear credencial
      const credential = await navigator.credentials.create(createCredentialOptions) as PublicKeyCredential;
      
      if (credential) {
        // Guardar información de la credencial localmente
        const credentialInfo = {
          id: credential.id,
          userId: userId,
          userName: userName,
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem(this.CREDENTIAL_KEY, JSON.stringify(credentialInfo));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error registering biometric:', error);
      return false;
    }
  }

  /**
   * Autentica usando biométrica
   */
  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const credentialInfo = this.getStoredCredential();
      if (!credentialInfo) {
        throw new Error('No biometric credential registered');
      }

      // Generar challenge para autenticación
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const getCredentialOptions: CredentialRequestOptions = {
        publicKey: {
          challenge: challenge,
          allowCredentials: [{
            id: new TextEncoder().encode(credentialInfo.id),
            type: 'public-key'
          }],
          timeout: 60000,
          userVerification: 'required'
        }
      };

      // Solicitar autenticación
      const assertion = await navigator.credentials.get(getCredentialOptions) as PublicKeyCredential;
      
      if (assertion) {
        console.log('Biometric authentication successful');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error authenticating with biometric:', error);
      return false;
    }
  }

  /**
   * Verifica si hay credenciales biométricas registradas
   */
  hasBiometricCredentials(): boolean {
    return !!this.getStoredCredential();
  }

  /**
   * Obtiene las credenciales almacenadas
   */
  private getStoredCredential(): any {
    const stored = localStorage.getItem(this.CREDENTIAL_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Elimina las credenciales biométricas
   */
  removeBiometricCredentials(): void {
    localStorage.removeItem(this.CREDENTIAL_KEY);
  }

  /**
   * Verifica si la autenticación biométrica está disponible
   */
  async isBiometricAvailable(): Promise<boolean> {
    // Forzar una nueva verificación si es necesario
    if (!this.isBiometricAvailableSubject.value) {
      await this.checkBiometricAvailability();
    }
    return this.isBiometricAvailableSubject.value;
  }

  /**
   * Wrapper para usar con Observable
   */
  registerBiometricObservable(userId: string, userName: string): Observable<boolean> {
    return from(this.registerBiometric(userId, userName));
  }

  /**
   * Wrapper para usar con Observable
   */
  authenticateWithBiometricObservable(): Observable<boolean> {
    return from(this.authenticateWithBiometric());
  }
}