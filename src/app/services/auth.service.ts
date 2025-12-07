import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
  fcmToken?: string;
  skipOtp?: boolean;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    type: string;
    token: string;
    otpSent?: boolean;
    userId?: number;
  };
}

export interface OtpVerifyRequest {
  userId: number;
  otpCode: string;
}

export interface OtpVerifyResponse {
  status: string;
  message: string;
  data?: {
    token?: string;
  };
}

export interface OtpResendResponse {
  status: string;
  message: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  roleId: number;
}

export interface RegisterResponse {
  status: string;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'moo_auth_token';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Check if user has a valid token in localStorage
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get the stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Add fcmToken from localStorage (if available) to the login payload
    const storedFcm = localStorage.getItem('pushToken');
    const payload: LoginRequest = storedFcm ? { ...credentials, fcmToken: storedFcm } : credentials;

    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, payload)
      .pipe(
        map(response => {
          // Si es login biométrico (skipOtp=true), guardar token directamente ignorando OTP
          // Si NO es biométrico, solo guardar si NO requiere OTP
          if (response.status === 'success' && response.data.token) {
            if (credentials.skipOtp || !response.data.otpSent) {
              // Store token in localStorage
              localStorage.setItem(this.TOKEN_KEY, response.data.token);
              // Update authentication state
              this.isAuthenticatedSubject.next(true);
            }
          }
          return response;
        })
      );
  }

  /**
   * Logout user and clear token
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    // Usuario está autenticado si tiene cualquier tipo de token (normal o biométrico)
    return !!token;
  }

  /**
   * Get user authentication status as observable
   */
  getAuthStatus(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  /**
   * Register a new user
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/auth/register`, userData);
  }

  /**
   * Verify OTP code
   */
  verifyOtp(userId: number, otpCode: string, tempToken: string): Observable<OtpVerifyResponse> {
    return this.http.post<OtpVerifyResponse>(`${this.API_URL}/auth/verify-otp`, {
      userId,
      otpCode
    }).pipe(
      map(response => {
        // Si la verificación es exitosa, guardar el token temporal como token definitivo
        if (response.status === 'success') {
          localStorage.setItem(this.TOKEN_KEY, tempToken);
          this.isAuthenticatedSubject.next(true);
        }
        return response;
      })
    );
  }

  /**
   * Resend OTP code
   */
  resendOtp(userId: number): Observable<OtpResendResponse> {
    return this.http.post<OtpResendResponse>(`${this.API_URL}/auth/resend-otp`, {
      userId
    });
  }
}