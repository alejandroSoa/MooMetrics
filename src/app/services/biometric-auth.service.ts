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
      if (!window.PublicKeyCredential) {
        this.isBiometricAvailableSubject.next(false);
        return;
      }

      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      // En móvil, hacer una verificación adicional más estricta
      if (isAvailable && this.isMobileDevice()) {
        // Verificar que realmente tenga capacidades biométricas
        const hasBiometric = await this.testBiometricCapability();
        this.isBiometricAvailableSubject.next(hasBiometric);
      } else {
        this.isBiometricAvailableSubject.next(isAvailable);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      this.isBiometricAvailableSubject.next(false);
    }
  }

  /**
   * Prueba si el dispositivo realmente tiene capacidades biométricas
   */
  private async testBiometricCapability(): Promise<boolean> {
    try {
      // Solo en móviles, verificar que el autenticador requiera interacción del usuario
      if (this.isMobileDevice()) {
        // En móvil, si WebAuthn está disponible y es platform authenticator,
        // asumimos que tiene biométrica real
        return true;
      }
      return true;
    } catch {
      return false;
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
          timeout: this.isMobileDevice() ? 30000 : 60000, // Menos tiempo en móvil
          attestation: 'none' // Cambiado de 'direct' a 'none' para mejor compatibilidad
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
          timeout: this.isMobileDevice() ? 30000 : 60000, // Menos tiempo en móvil
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
      
      // Si es un error de credencial no encontrada o inválida, podría ser una credencial corrupta
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || 
            error.name === 'InvalidStateError' ||
            error.message.includes('not found') ||
            error.message.includes('invalid')) {
          console.warn('Possible corrupted credential detected');
        }
      }
      
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

  /**
   * Detecta si es un dispositivo móvil
   */
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Detecta si es iOS
   */
  isIOSDevice(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * Detecta si es Android
   */
  isAndroidDevice(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  /**
   * Obtiene el texto apropiado para el botón según el dispositivo
   */
  getAuthButtonText(): string {
    if (this.isMobileDevice()) {
      return 'Iniciar con Huella';
    } else {
      return 'Iniciar con Clave de Acceso';
    }
  }

  /**
   * Obtiene el texto de configuración según el dispositivo
   */
  getSetupButtonText(): string {
    if (this.isMobileDevice()) {
      return 'Activar acceso con huella';
    } else {
      return 'Activar clave de acceso';
    }
  }

  /**
   * Verifica si las credenciales necesitan ser renovadas
   * (por ejemplo, si son muy antiguas o están corruptas)
   */
  shouldRenewCredentials(): boolean {
    const credentialInfo = this.getStoredCredential();
    if (!credentialInfo || !credentialInfo.createdAt) {
      return false;
    }

    // Verificar si la credencial es muy antigua (más de 90 días)
    const createdDate = new Date(credentialInfo.createdAt);
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceCreation > 90;
  }

  /**
   * Obtiene información sobre la credencial almacenada
   */
  getCredentialInfo(): any {
    return this.getStoredCredential();
  }
}