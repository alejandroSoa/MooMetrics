import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatbotCommandRequest {
  command: string;
  stable_id?: number;
  name?: string;
}

export interface ChatbotResponse {
  status: string;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'moo_auth_token';

  constructor(private http: HttpClient) {}

  /**
   * Get auth headers with token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY);
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  /**
   * Send command to chatbot endpoint
   */
  sendCommand(request: ChatbotCommandRequest): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(
      `${this.API_URL}/chatbot/command`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Helper method for showInventory command
   */
  getInventory(stable_id: number): Observable<ChatbotResponse> {
    return this.sendCommand({
      command: 'showInventory',
      stable_id: stable_id
    });
  }

  /**
   * Helper method for showEvents command
   */
  getEvents(stable_id: number): Observable<ChatbotResponse> {
    return this.sendCommand({
      command: 'showEvents',
      stable_id: stable_id
    });
  }

  /**
   * Helper method for getCowList command
   */
  getCowList(stable_id: number): Observable<ChatbotResponse> {
    return this.sendCommand({
      command: 'getCowList',
      stable_id: stable_id
    });
  }

  /**
   * Helper method for getCowDetail command
   */
  getCowDetail(name: string): Observable<ChatbotResponse> {
    return this.sendCommand({
      command: 'getCowDetail',
      name: name
    });
  }

  /**
   * Helper method for searchCow command
   */
  searchCow(stable_id: number): Observable<ChatbotResponse> {
    return this.sendCommand({
      command: 'searchCow',
      stable_id: stable_id
    });
  }
}
