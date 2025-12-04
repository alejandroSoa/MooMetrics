import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private baseUrl = 'https://paginachidota.lat/data-generator';

  constructor(private http: HttpClient) { }

  /**
   * Insert inventory data for a stable in a date range
   */
  insertInventoryData(stable_id: number, startDate: string, endDate: string): Observable<DataGeneratorResponse> {
    const payload: DataGeneratorRequest = {
      stable_id,
      startDate,
      endDate
    };

    return this.http.post<DataGeneratorResponse>(`${this.baseUrl}/inventory`, payload);
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

    return this.http.post<DataGeneratorResponse>(`${this.baseUrl}/events`, payload);
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
}