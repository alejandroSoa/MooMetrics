import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Channel {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  stableId: number;
  createdBy?: number;
}

export interface StableInfo {
  id: number;
  name: string;
}

export interface ChannelsData {
  stable: StableInfo;
  channels: Channel[];
}

export interface ChannelsResponse {
  status: string;
  message: string;
  data: ChannelsData;
}

export interface ChannelResponse {
  status: string;
  message: string;
  data: Channel;
}

export interface CreateChannelRequest {
  name: string;
  description?: string;
  stableId: number;
}

export interface UpdateChannelRequest {
  name: string;
  description?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Get all channels for a specific stable
   */
  getChannelsByStableId(stableId: number): Observable<ChannelsResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<ChannelsResponse>(`${this.API_URL}/stables/${stableId}/channels`, { headers });
  }

  /**
   * Get a specific channel by ID
   */
  getChannelById(channelId: number): Observable<ChannelResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<ChannelResponse>(`${this.API_URL}/channels/${channelId}`, { headers });
  }

  /**
   * Create a new channel for a stable
   */
  createChannel(stableId: number, channelData: CreateChannelRequest): Observable<ChannelResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<ChannelResponse>(`${this.API_URL}/channels/${stableId}`, channelData, { headers });
  }

  /**
   * Update a channel
   */
  updateChannel(channelId: number, channelData: UpdateChannelRequest): Observable<ChannelResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<ChannelResponse>(`${this.API_URL}/channels/${channelId}`, channelData, { headers });
  }

  /**
   * Delete a channel
   */
  deleteChannel(channelId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.API_URL}/channels/${channelId}`, { headers });
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