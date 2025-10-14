import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Message {
  id: number;
  content: string;
  channelId: number;
  userId: number;
  userName?: string;
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

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Get all messages for a specific channel
   */
  getMessagesByChannelId(channelId: number): Observable<MessagesResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<MessagesResponse>(`${this.API_URL}/channels/${channelId}/messages`, { headers });
  }

  /**
   * Send a new message to a channel
   */
  sendMessage(channelId: number, messageData: SendMessageRequest): Observable<MessageResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<MessageResponse>(`${this.API_URL}/channels/${channelId}/messages`, messageData, { headers });
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