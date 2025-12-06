import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { environment } from '../../environments/environment';

export interface Stable {
  id: number;
  name: string;
  isActive: boolean;
}

export interface StablesResponse {
  status: string;
  message: string;
  data: Stable[];
}

export interface StableResponse {
  status: string;
  message: string;
  data: Stable;
}

export interface UpdateStableRequest {
  name: string;
  isActive: boolean;
}

export interface CreateStableRequest {
  name: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StableService {
  private readonly API_URL = environment.apiUrl;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private cacheService: CacheService
  ) {}

  /**
   * Get all stables from the API with cache support
   */
  getStables(): Observable<StablesResponse> {
    const networkCall = () => {
      const headers = this.getAuthHeaders();
      return this.http.get<StablesResponse>(`${this.API_URL}/stables`, { headers });
    };
    
    return this.cacheService.networkFirst(
      'stables',
      networkCall,
      this.CACHE_DURATION
    );
  }

  /**
   * Get a specific stable by ID with cache support
   */
  getStableById(id: number): Observable<StableResponse> {
    const networkCall = () => {
      const headers = this.getAuthHeaders();
      return this.http.get<StableResponse>(`${this.API_URL}/stables/${id}`, { headers });
    };
    
    return this.cacheService.networkFirst(
      `stable_${id}`,
      networkCall,
      this.CACHE_DURATION
    );
  }

  /**
   * Update a stable
   * Clears cache after update
   */
  updateStable(id: number, stableData: UpdateStableRequest): Observable<StableResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<StableResponse>(`${this.API_URL}/stables/${id}`, stableData, { headers }).pipe(
      tap(() => {
        // Clear stable cache to refresh data
        this.cacheService.remove(`stable_${id}`);
        this.cacheService.remove('stables');
      })
    );
  }

  /**
   * Create a new stable
   * Clears cache after creation
   */
  createStable(stableData: CreateStableRequest): Observable<StableResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<StableResponse>(`${this.API_URL}/stables`, stableData, { headers }).pipe(
      tap(() => {
        // Clear stables cache to refresh list
        this.cacheService.remove('stables');
      })
    );
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