import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

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
  private readonly API_URL = 'http://165.227.113.141';

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Get all stables from the API
   */
  getStables(): Observable<StablesResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<StablesResponse>(`${this.API_URL}/stables`, { headers });
  }

  /**
   * Get a specific stable by ID
   */
  getStableById(id: number): Observable<StableResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<StableResponse>(`${this.API_URL}/stables/${id}`, { headers });
  }

  /**
   * Update a stable
   */
  updateStable(id: number, stableData: UpdateStableRequest): Observable<StableResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<StableResponse>(`${this.API_URL}/stables/${id}`, stableData, { headers });
  }

  /**
   * Create a new stable
   */
  createStable(stableData: CreateStableRequest): Observable<StableResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<StableResponse>(`${this.API_URL}/stables`, stableData, { headers });
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