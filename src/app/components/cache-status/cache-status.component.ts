import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CacheService } from '../../services/cache.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cache-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cache-status-container">
      <div class="cache-header">
        <h3>📦 Estado del Caché</h3>
        <div class="connection-status" [class.online]="isOnline" [class.offline]="!isOnline">
          {{ isOnline ? '🟢 En línea' : '🔴 Sin conexión' }}
        </div>
      </div>
      
      <div class="cache-stats" *ngIf="cacheStats">
        <div class="stat-item">
          <span class="stat-label">Elementos guardados:</span>
          <span class="stat-value">{{ cacheStats.totalEntries }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Tamaño total:</span>
          <span class="stat-value">{{ cacheStats.totalSize }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Última actualización:</span>
          <span class="stat-value">{{ cacheStats.newestEntry }}</span>
        </div>
      </div>
      
      <div class="cache-actions">
        <button class="refresh-btn" (click)="refreshStats()" [disabled]="isRefreshing">
          {{ isRefreshing ? '🔄 Actualizando...' : '🔄 Actualizar' }}
        </button>
        <button class="clear-btn" (click)="clearCache()" [disabled]="isClearing">
          {{ isClearing ? '🧹 Limpiando...' : '🧹 Limpiar Caché' }}
        </button>
      </div>
      
      <div class="cache-info">
        <p><strong>ℹ️ Información:</strong></p>
        <ul>
          <li>Los datos se guardan automáticamente cuando tienes conexión</li>
          <li>Cuando estés sin internet, verás la última información guardada</li>
          <li>Los establos, canales, mensajes y datos de vacas se mantienen offline</li>
          <li>Los mensajes nuevos se sincronizarán cuando recuperes la conexión</li>
        </ul>
      </div>
      
      <div class="offline-features" *ngIf="!isOnline">
        <h4>🔒 Funciones Offline Disponibles:</h4>
        <div class="feature-list">
          <div class="feature-item available">
            ✅ Ver establos guardados
          </div>
          <div class="feature-item available">
            ✅ Navegar por canales
          </div>
          <div class="feature-item available">
            ✅ Leer mensajes anteriores
          </div>
          <div class="feature-item available">
            ✅ Consultar datos de vacas
          </div>
          <div class="feature-item unavailable">
            ❌ Enviar mensajes nuevos
          </div>
          <div class="feature-item unavailable">
            ❌ Obtener datos actualizados
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cache-status-container {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin: 20px 0;
    }
    
    .cache-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .cache-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
    }
    
    .connection-status {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }
    
    .connection-status.online {
      background: #e8f5e8;
      color: #2e7d32;
      border: 1px solid #4caf50;
    }
    
    .connection-status.offline {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #f44336;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
    
    .cache-stats {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }
    
    .stat-label {
      color: #666;
      font-weight: 500;
    }
    
    .stat-value {
      color: #333;
      font-weight: 600;
    }
    
    .cache-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .refresh-btn, .clear-btn {
      flex: 1;
      min-width: 140px;
      padding: 12px 16px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .refresh-btn {
      background: #007bff;
      color: white;
    }
    
    .refresh-btn:hover:not(:disabled) {
      background: #0056b3;
      transform: translateY(-1px);
    }
    
    .clear-btn {
      background: #dc3545;
      color: white;
    }
    
    .clear-btn:hover:not(:disabled) {
      background: #c82333;
      transform: translateY(-1px);
    }
    
    .refresh-btn:disabled, .clear-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .cache-info {
      background: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #2196f3;
    }
    
    .cache-info p {
      margin: 0 0 12px 0;
      color: #1565c0;
      font-weight: 600;
    }
    
    .cache-info ul {
      margin: 0;
      padding-left: 20px;
      color: #333;
    }
    
    .cache-info li {
      margin-bottom: 8px;
      line-height: 1.4;
    }
    
    .offline-features {
      background: #fff3e0;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
    }
    
    .offline-features h4 {
      margin: 0 0 15px 0;
      color: #e65100;
    }
    
    .feature-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }
    
    .feature-item {
      padding: 8px 12px;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.9rem;
    }
    
    .feature-item.available {
      background: #e8f5e8;
      color: #2e7d32;
      border: 1px solid #81c784;
    }
    
    .feature-item.unavailable {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ef5350;
    }
    
    /* Mobile responsive */
    @media (max-width: 768px) {
      .cache-status-container {
        margin: 10px 0;
        padding: 15px;
      }
      
      .cache-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      
      .cache-actions {
        flex-direction: column;
      }
      
      .refresh-btn, .clear-btn {
        min-width: unset;
      }
    }
  `]
})
export class CacheStatusComponent implements OnInit, OnDestroy {
  isOnline = navigator.onLine;
  cacheStats: any = null;
  isRefreshing = false;
  isClearing = false;
  private onlineSubscription: Subscription | null = null;

  constructor(private cacheService: CacheService) {}

  ngOnInit() {
    this.refreshStats();
    
    // Subscribe to online status changes
    this.onlineSubscription = this.cacheService.isOnline$.subscribe(
      isOnline => {
        this.isOnline = isOnline;
        if (isOnline) {
          // Refresh stats when coming back online
          setTimeout(() => this.refreshStats(), 1000);
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.onlineSubscription) {
      this.onlineSubscription.unsubscribe();
    }
  }

  refreshStats() {
    this.isRefreshing = true;
    
    try {
      this.cacheStats = this.cacheService.getCacheStats();
      console.log('📊 Cache stats updated:', this.cacheStats);
    } catch (error) {
      console.error('Error refreshing cache stats:', error);
    } finally {
      setTimeout(() => {
        this.isRefreshing = false;
      }, 500); // Show loading state briefly
    }
  }

  clearCache() {
    if (confirm('¿Estás seguro de que quieres limpiar todo el caché? Se eliminarán todos los datos guardados offline.')) {
      this.isClearing = true;
      
      try {
        this.cacheService.clearAll();
        this.refreshStats();
        alert('✅ Caché limpiado exitosamente. Los datos se volverán a descargar cuando tengas conexión.');
      } catch (error) {
        console.error('Error clearing cache:', error);
        alert('❌ Error al limpiar el caché. Inténtalo de nuevo.');
      } finally {
        setTimeout(() => {
          this.isClearing = false;
        }, 1000);
      }
    }
  }
}