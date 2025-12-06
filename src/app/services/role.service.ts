import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { environment } from '../../environments/environment';

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface RolesResponse {
  status: string;
  message: string;
  data: Role[];
}

export interface RoleResponse {
  status: string;
  message: string;
  data: Role;
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly API_URL = environment.apiUrl;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private cacheService: CacheService
  ) {}

  /**
   * Get all roles from the API with cache support
   */
  getRoles(): Observable<RolesResponse> {
    const networkCall = () => {
      const headers = this.getAuthHeaders();
      return this.http.get<RolesResponse>(`${this.API_URL}/roles`, { headers });
    };
    
    return this.cacheService.networkFirst(
      'roles',
      networkCall,
      this.CACHE_DURATION
    );
  }

  /**
   * Get a specific role by ID with cache support
   */
  getRoleById(id: number): Observable<RoleResponse> {
    const networkCall = () => {
      const headers = this.getAuthHeaders();
      return this.http.get<RoleResponse>(`${this.API_URL}/roles/${id}`, { headers });
    };
    
    return this.cacheService.networkFirst(
      `role_${id}`,
      networkCall,
      this.CACHE_DURATION
    );
  }

  /**
   * Update a role
   */
  updateRole(id: number, roleData: UpdateRoleRequest): Observable<RoleResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<RoleResponse>(`${this.API_URL}/roles/${id}`, roleData, { headers });
  }

  /**
   * Create a new role
   */
  createRole(roleData: CreateRoleRequest): Observable<RoleResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<RoleResponse>(`${this.API_URL}/roles`, roleData, { headers });
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