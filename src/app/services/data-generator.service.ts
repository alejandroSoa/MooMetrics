import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface DataGeneratorRequest {
  stable_id: number;
  startDate: string;
  endDate: string;
}

export interface DataGeneratorResponse {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataGeneratorService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Insert inventory data for a stable in a date range
   */
  insertInventoryData(stable_id: number, startDate: string, endDate: string): Observable<DataGeneratorResponse> {
    const payload: DataGeneratorRequest = {
      stable_id,
      startDate,
      endDate
    };

    const headers = this.getAuthHeaders();
    const url = `${this.API_URL}/data-generator/inventory`;
    
    console.log('🚀 Data Generator Service - INSERT INVENTORY');
    console.log('📍 URL:', url);
    console.log('🔧 Method: POST');
    console.log('📦 Payload:', payload);
    console.log('🔐 Headers:', headers);
    
    return this.http.post<DataGeneratorResponse>(url, payload, { headers });
  }

  /**
   * Insert events data for a stable in a date range
   */
  insertEventsData(stable_id: number, startDate: string, endDate: string): Observable<DataGeneratorResponse> {
    const payload: DataGeneratorRequest = {
      stable_id,
      startDate,
      endDate
    };

    const headers = this.getAuthHeaders();
    const url = `${this.API_URL}/data-generator/events`;
    
    console.log('🚀 Data Generator Service - INSERT EVENTS');
    console.log('📍 URL:', url);
    console.log('🔧 Method: POST');
    console.log('📦 Payload:', payload);
    console.log('🔐 Headers:', headers);
    
    return this.http.post<DataGeneratorResponse>(url, payload, { headers });
  }

  /**
   * Delete inventory data for a stable in a date range
   */
  deleteInventoryData(stable_id: number, startDate: string, endDate: string): Observable<DataGeneratorResponse> {
    const payload: DataGeneratorRequest = {
      stable_id,
      startDate,
      endDate
    };

    const headers = this.getAuthHeaders();
    const url = `${this.API_URL}/data-generator/clear`;
    
    console.log('🗑️ Data Generator Service - DELETE INVENTORY');
    console.log('📍 URL:', url);
    console.log('🔧 Method: DELETE');
    console.log('📦 Payload:', { ...payload, table: 'inventory' });
    console.log('🔐 Headers:', headers);
    
    return this.http.delete<DataGeneratorResponse>(url, { 
      headers, 
      body: { ...payload, table: 'inventory' }
    });
  }

  /**
   * Delete events data for a stable in a date range
   */
  deleteEventsData(stable_id: number, startDate: string, endDate: string): Observable<DataGeneratorResponse> {
    const payload: DataGeneratorRequest = {
      stable_id,
      startDate,
      endDate
    };

    const headers = this.getAuthHeaders();
    const url = `${this.API_URL}/data-generator/clear`;
    
    console.log('🗑️ Data Generator Service - DELETE EVENTS');
    console.log('📍 URL:', url);
    console.log('🔧 Method: DELETE');
    console.log('📦 Payload:', { ...payload, table: 'events' });
    console.log('🔐 Headers:', headers);
    
    return this.http.delete<DataGeneratorResponse>(url, { 
      headers, 
      body: { ...payload, table: 'events' }
    });
  }

  /**
   * Process data insertion following the required flow:
   * 1. Insert inventory data first
   * 2. Then insert events data
   */
  processDataInsertion(stable_id: number, startDate: string, endDate: string): Observable<{
    inventory: DataGeneratorResponse;
    events: DataGeneratorResponse;
    success: boolean;
  }> {
    return new Observable(observer => {
      // First insert inventory data
      this.insertInventoryData(stable_id, startDate, endDate).subscribe({
        next: (inventoryResponse) => {
          if (inventoryResponse.status === 'success') {
            // If inventory insertion is successful, proceed with events
            this.insertEventsData(stable_id, startDate, endDate).subscribe({
              next: (eventsResponse) => {
                observer.next({
                  inventory: inventoryResponse,
                  events: eventsResponse,
                  success: eventsResponse.status === 'success'
                });
                observer.complete();
              },
              error: (eventsError) => {
                observer.next({
                  inventory: inventoryResponse,
                  events: { 
                    status: 'error', 
                    message: 'Error al insertar eventos: ' + eventsError.message 
                  },
                  success: false
                });
                observer.complete();
              }
            });
          } else {
            // If inventory insertion fails, don't proceed with events
            observer.next({
              inventory: inventoryResponse,
              events: { 
                status: 'error', 
                message: 'No se insertaron eventos debido al fallo en inventario' 
              },
              success: false
            });
            observer.complete();
          }
        },
        error: (inventoryError) => {
          observer.next({
            inventory: { 
              status: 'error', 
              message: 'Error al insertar inventario: ' + inventoryError.message 
            },
            events: { 
              status: 'error', 
              message: 'No se insertaron eventos debido al fallo en inventario' 
            },
            success: false
          });
          observer.complete();
        }
      });
    });
  }

  /**
   * Process data deletion following the required flow:
   * 1. Delete events data first
   * 2. Then delete inventory data
   */
  processDataDeletion(stable_id: number, startDate: string, endDate: string): Observable<{
    inventory: DataGeneratorResponse;
    events: DataGeneratorResponse;
    success: boolean;
  }> {
    return new Observable(observer => {
      // First delete events data
      this.deleteEventsData(stable_id, startDate, endDate).subscribe({
        next: (eventsResponse) => {
          if (eventsResponse.status === 'success') {
            // If events deletion is successful, proceed with inventory
            this.deleteInventoryData(stable_id, startDate, endDate).subscribe({
              next: (inventoryResponse) => {
                observer.next({
                  inventory: inventoryResponse,
                  events: eventsResponse,
                  success: inventoryResponse.status === 'success'
                });
                observer.complete();
              },
              error: (inventoryError) => {
                observer.next({
                  inventory: { 
                    status: 'error', 
                    message: 'Error al eliminar inventario: ' + inventoryError.message 
                  },
                  events: eventsResponse,
                  success: false
                });
                observer.complete();
              }
            });
          } else {
            // If events deletion fails, don't proceed with inventory
            observer.next({
              inventory: { 
                status: 'error', 
                message: 'No se eliminó inventario debido al fallo en eventos' 
              },
              events: eventsResponse,
              success: false
            });
            observer.complete();
          }
        },
        error: (eventsError) => {
          observer.next({
            inventory: { 
              status: 'error', 
              message: 'No se eliminó inventario debido al fallo en eventos' 
            },
            events: { 
              status: 'error', 
              message: 'Error al eliminar eventos: ' + eventsError.message 
            },
            success: false
          });
          observer.complete();
        }
      });
    });
  }

  /**
   * Get authentication headers with bearer token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    return headers;
  }
}