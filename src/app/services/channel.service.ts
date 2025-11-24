import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
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
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private cacheService: CacheService
  ) {}

  /**
   * Get all channels for a specific stable with cache support
   */
  getChannelsByStableId(stableId: number): Observable<ChannelsResponse> {
    const networkCall = () => {
      const headers = this.getAuthHeaders();
      return this.http.get<ChannelsResponse>(`${this.API_URL}/stables/${stableId}/channels`, { headers });
    };
    
    return this.cacheService.cacheFirst(
      `channels_${stableId}`,
      networkCall,
      this.CACHE_DURATION
    );
  }

  /**
   * Get a specific channel by ID with cache support
   */
  getChannelById(channelId: number): Observable<ChannelResponse> {
    const networkCall = () => {
      const headers = this.getAuthHeaders();
      return this.http.get<ChannelResponse>(`${this.API_URL}/channels/${channelId}`, { headers });
    };
    
    return this.cacheService.cacheFirst(
      `channel_${channelId}`,
      networkCall,
      this.CACHE_DURATION
    );
  }

  /**
   * Create a new channel for a stable
   * Clears relevant cache after creation
   */
  createChannel(channelData: CreateChannelRequest): Observable<ChannelResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<ChannelResponse>(`${this.API_URL}/channels`, channelData, { headers }).pipe(
      tap(() => {
        // Clear channels cache for this stable to refresh the list
        this.cacheService.remove(`channels_${channelData.stableId}`);
      })
    );
  }

  /**
   * Update a channel
   * Clears relevant cache after update
   */
  updateChannel(channelId: number, channelData: UpdateChannelRequest): Observable<ChannelResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<ChannelResponse>(`${this.API_URL}/channels/${channelId}`, channelData, { headers }).pipe(
      tap(() => {
        // Clear specific channel cache and related channels list
        this.cacheService.remove(`channel_${channelId}`);
      })
    );
  }

  /**
   * Delete a channel
   * Clears relevant cache after deletion
   */
  deleteChannel(channelId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.API_URL}/channels/${channelId}`, { headers }).pipe(
      tap(() => {
        // Clear specific channel cache and messages
        this.cacheService.remove(`channel_${channelId}`);
        this.cacheService.remove(`messages_${channelId}`);
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