import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { environment } from '../../environments/environment';

export interface Message {
  id: number;
  content: string;
  channelId: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  isBot?: boolean;
}

export interface MessagesResponse {
  status: string;
  message: string;
  data: Message[];
}

export interface MessageResponse {
  status: string;
  message: string;
  data: Message;
}

export interface SendMessageRequest {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly API_URL = environment.apiUrl;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for messages

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private cacheService: CacheService
  ) {}

  /**
   * Get all messages for a specific channel with cache support
   */
  getMessagesByChannelId(channelId: number): Observable<MessagesResponse> {
    const networkCall = () => {
      const headers = this.getAuthHeaders();
      return this.http.get<MessagesResponse>(`${this.API_URL}/channels/${channelId}/messages`, { headers });
    };
    
    return this.cacheService.cacheFirst(
      `messages_${channelId}`,
      networkCall,
      this.CACHE_DURATION
    );
  }

  /**
   * Send a new message to a channel
   * Clears messages cache to refresh with new message
   */
  sendMessage(channelId: number, messageData: SendMessageRequest): Observable<MessageResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<MessageResponse>(`${this.API_URL}/channels/${channelId}/messages`, messageData, { headers }).pipe(
      tap(() => {
        // Clear messages cache for this channel to refresh with new message
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