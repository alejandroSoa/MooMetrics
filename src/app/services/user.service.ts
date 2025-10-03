import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

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
  private readonly API_URL = 'http://165.227.113.141';

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Get all users from the API
   */
  getUsers(): Observable<UsersResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<UsersResponse>(`${this.API_URL}/users`, { headers });
  }

  /**
   * Get a specific user by ID
   */
  getUserById(id: number): Observable<UserResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserResponse>(`${this.API_URL}/users/${id}`, { headers });
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