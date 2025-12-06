import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

export interface UsersResponse {
  status: string;
  message: string;
  data: User[];
}

export interface UserResponse {
  status: string;
  message: string;
  data: User;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  roleId: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = environment.apiUrl;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private cacheService: CacheService
  ) {}

  /**
   * Get all users from the API with cache support
   */
  getUsers(): Observable<UsersResponse> {
    const networkCall = () => {
      const headers = this.getAuthHeaders();
      return this.http.get<UsersResponse>(`${this.API_URL}/users`, { headers });
    };
    
    return this.cacheService.cacheFirst(
      'users',
      networkCall,
      this.CACHE_DURATION
    );
  }

  /**
   * Get a specific user by ID with cache support
   */
  getUserById(id: number): Observable<UserResponse> {
    const networkCall = () => {
      const headers = this.getAuthHeaders();
      return this.http.get<UserResponse>(`${this.API_URL}/users/${id}`, { headers });
    };
    
    return this.cacheService.cacheFirst(
      `user_${id}`,
      networkCall,
      this.CACHE_DURATION
    );
  }

  /**
   * Update a user
   */
  updateUser(id: number, userData: UpdateUserRequest): Observable<UserResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<UserResponse>(`${this.API_URL}/users/${id}`, userData, { headers });
  }

  /**
   * Get authentication headers with bearer token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}