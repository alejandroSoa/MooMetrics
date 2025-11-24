import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

// Interfaces para las respuestas de la API
export interface Cow {
  id: string;
  name: string;
  breed: string;
  age: string;
  birthDate: string;
  sex: string;
  barnName: string;
  stableId: number;
  lactationNumber?: number;
  daysInMilk?: number;
  dailyProduction?: number;
  lastEvent?: {
    type: string;
    date: string;
    technician: string;
    status: string;
  };
  events?: {
    diagnoses: number;
    pregnancyChecks: number;
    breedings: number;
    treatments: number;
    births: number;
  };
}

export interface CowsListResponse {
  status: string;
  message: string;
  data: {
    cows: Cow[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface CowDetailResponse {
  status: string;
  message: string;
  data: Cow;
}

export interface InventoryResponse {
  status: string;
  message: string;
  data: {
    stableName: string;
    summary: {
      totalCows: number;
      females: number;
      males: number;
    };
    byBreed: Array<{
      breed: string;
      count: number;
    }>;
    byAge: Array<{
      ageRange: string;
      count: number;
    }>;
    byStatus: Array<{
      status: string;
      count: number;
    }>;
  };
}

export interface EventsResponse {
  status: string;
  message: string;
  data: {
    stableName: string;
    period: string;
    veterinaryEvents: Array<{
      type: string;
      count: number;
    }>;
    reproductiveEvents: Array<{
      type: string;
      count: number;
    }>;
    managementEvents: Array<{
      type: string;
      count: number;
    }>;
    totalEvents: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CowService {
  private baseUrl = '/api/v1'; // URL base de la API
  private mockCows: Cow[] = [];

  constructor() {
    this.initializeMockData();
  }

  /**
   * Initialize mock data for cows
   */
  private initializeMockData(): void {
    const breeds = ['Holstein', 'Jersey', 'Angus', 'Simmental', 'Charolais'];
    const ages = ['1 año', '2 años', '3 años', '4 años', '5 años', '6 años'];
    const sexes = ['F', 'M'];
    
    // Generate 77 mock cows
    for (let i = 1; i <= 77; i++) {
      const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];
      const randomAge = ages[Math.floor(Math.random() * ages.length)];
      const randomSex = i <= 62 ? 'F' : sexes[Math.floor(Math.random() * sexes.length)]; // More females
      
      this.mockCows.push({
        id: `PKY${i.toString().padStart(3, '0')}`,
        name: `Vaca ${i}`,
        breed: randomBreed,
        age: randomAge,
        birthDate: this.generateRandomBirthDate(),
        sex: randomSex,
        barnName: `Corral ${Math.floor(Math.random() * 10) + 1}`,
        stableId: 1, // Assuming current stable
        lactationNumber: randomSex === 'F' ? Math.floor(Math.random() * 5) + 1 : undefined,
        daysInMilk: randomSex === 'F' ? Math.floor(Math.random() * 300) + 1 : undefined,
        dailyProduction: randomSex === 'F' ? Math.round((Math.random() * 20 + 15) * 10) / 10 : undefined,
        lastEvent: {
          type: 'Chequeo embarazo',
          date: this.generateRandomRecentDate(),
          technician: `Dr. ${['García', 'López', 'Martínez', 'Rodríguez', 'Hernández'][Math.floor(Math.random() * 5)]}`,
          status: randomSex === 'F' ? 'Gestante - 45 días' : 'Sano'
        },
        events: {
          diagnoses: Math.floor(Math.random() * 15) + 1,
          pregnancyChecks: randomSex === 'F' ? Math.floor(Math.random() * 10) + 1 : 0,
          breedings: randomSex === 'F' ? Math.floor(Math.random() * 5) + 1 : 0,
          treatments: Math.floor(Math.random() * 5),
          births: randomSex === 'F' ? Math.floor(Math.random() * 3) : 0
        }
      });
    }
  }

  /**
   * Get paginated list of cows for a specific stable
   * API Route: GET /api/v1/stables/{stableId}/cows?page={page}&limit={limit}
   */
  getCowsByStableId(stableId: number, page: number = 1, limit: number = 7): Observable<CowsListResponse> {
    console.log(`🔗 API Call: GET ${this.baseUrl}/stables/${stableId}/cows?page=${page}&limit=${limit}`);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const cowsOnPage = this.mockCows.slice(startIndex, endIndex);
    const totalPages = Math.ceil(this.mockCows.length / limit);

    const response: CowsListResponse = {
      status: 'success',
      message: 'Vacas obtenidas exitosamente',
      data: {
        cows: cowsOnPage,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: this.mockCows.length,
          itemsPerPage: limit
        }
      }
    };

    // Simulate API delay
    return of(response).pipe(delay(300));
  }

  /**
   * Get detailed information of a specific cow
   * API Route: GET /api/v1/cows/{cowId}
   */
  getCowDetail(cowId: string): Observable<CowDetailResponse> {
    console.log(`🔗 API Call: GET ${this.baseUrl}/cows/${cowId}`);
    
    const cow = this.mockCows.find(c => c.id === cowId);
    
    if (!cow) {
      return of({
        status: 'error',
        message: `No se encontró la vaca con ID ${cowId}`,
        data: {} as Cow
      }).pipe(delay(200));
    }

    const response: CowDetailResponse = {
      status: 'success',
      message: 'Información de la vaca obtenida exitosamente',
      data: cow
    };

    // Simulate API delay
    return of(response).pipe(delay(400));
  }

  /**
   * Get inventory report for a specific stable
   * API Route: GET /api/v1/stables/{stableId}/inventory
   */
  getInventoryByStableId(stableId: number): Observable<InventoryResponse> {
    console.log(`🔗 API Call: GET ${this.baseUrl}/stables/${stableId}/inventory`);
    
    const stableCows = this.mockCows.filter(cow => cow.stableId === stableId);
    
    // Calculate summary
    const summary = {
      totalCows: stableCows.length,
      females: stableCows.filter(cow => cow.sex === 'F').length,
      males: stableCows.filter(cow => cow.sex === 'M').length
    };

    // Calculate by breed
    const breedCounts: { [key: string]: number } = {};
    stableCows.forEach(cow => {
      breedCounts[cow.breed] = (breedCounts[cow.breed] || 0) + 1;
    });
    const byBreed = Object.entries(breedCounts).map(([breed, count]) => ({ breed, count }));

    // Mock age ranges
    const byAge = [
      { ageRange: '< 1 año', count: 45 },
      { ageRange: '1-3 años', count: 89 },
      { ageRange: '> 3 años', count: 111 }
    ];

    // Mock status
    const byStatus = [
      { status: 'En producción', count: 167 },
      { status: 'Secas', count: 45 },
      { status: 'Novillas', count: 33 }
    ];

    const response: InventoryResponse = {
      status: 'success',
      message: 'Inventario obtenido exitosamente',
      data: {
        stableName: 'MSD', // This should come from stable service
        summary,
        byBreed,
        byAge,
        byStatus
      }
    };

    // Simulate API delay
    return of(response).pipe(delay(500));
  }

  /**
   * Get events report for a specific stable
   * API Route: GET /api/v1/stables/{stableId}/events?period={period}
   */
  getEventsByStableId(stableId: number, period: string = 'last30days'): Observable<EventsResponse> {
    console.log(`🔗 API Call: GET ${this.baseUrl}/stables/${stableId}/events?period=${period}`);
    
    const response: EventsResponse = {
      status: 'success',
      message: 'Reporte de eventos obtenido exitosamente',
      data: {
        stableName: 'MSD', // This should come from stable service
        period: 'Últimos 30 días',
        veterinaryEvents: [
          { type: 'DNB (Do Not Breed)', count: 12 },
          { type: 'Abortos (Abortions)', count: 3 },
          { type: 'Diagnósticos (Diagnosis)', count: 45 },
          { type: 'Chequeos embarazo (Pregchecks)', count: 67 }
        ],
        reproductiveEvents: [
          { type: 'Nacimientos (Births)', count: 23 },
          { type: 'Cruces (Breedings)', count: 34 },
          { type: 'Secado (Dryoffs)', count: 18 },
          { type: 'Partos frescos (Freshs)', count: 21 }
        ],
        managementEvents: [
          { type: 'Descartes (Culls)', count: 8 },
          { type: 'Tratamiento cascos (Hoofs)', count: 15 },
          { type: 'Movimientos (Moves)', count: 29 }
        ],
        totalEvents: 275
      }
    };

    // Simulate API delay
    return of(response).pipe(delay(600));
  }

  /**
   * Generate random birth date
   */
  private generateRandomBirthDate(): string {
    const start = new Date(2018, 0, 1);
    const end = new Date(2023, 11, 31);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toLocaleDateString('es-ES');
  }

  /**
   * Generate random recent date
   */
  private generateRandomRecentDate(): string {
    const start = new Date(2024, 10, 1);
    const end = new Date(2024, 11, 23);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toLocaleDateString('es-ES');
  }
}