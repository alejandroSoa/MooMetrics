import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import { map, tap, catchError, timeout } from 'rxjs/operators';
import { StablesResponse } from './stable.service';
import { ChannelsResponse } from './channel.service';
import { MessagesResponse } from './message.service';
import { CowsListResponse, CowDetailResponse, InventoryResponse, EventsResponse } from './cow.service';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry?: number; // Optional expiry time in milliseconds
}

export interface CacheIndex {
  stables: number;
  channels: { [stableId: string]: number };
  messages: { [channelId: string]: number };
  cows: { [stableId: string]: { [page: string]: number } };
  cowDetails: { [cowId: string]: number };
  inventory: { [stableId: string]: number };
  events: { [stableId: string]: number };
  roles: number;
  roleDetails: { [roleId: string]: number };
  users: number;
  userDetails: { [userId: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly CACHE_PREFIX = 'moo_cache_';
  private readonly INDEX_KEY = 'moo_cache_index';
  private readonly DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly SHORT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for dynamic data
  
  constructor() {
    this.cleanExpiredCache();
  }



  /**
   * Store data in cache
   */
  set<T>(key: string, data: T, duration: number = this.DEFAULT_CACHE_DURATION): void {
    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + duration
      };
      
      const cacheKey = this.CACHE_PREFIX + key;
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      
      // Update cache index
      this.updateCacheIndex(key);
      
      console.log(`💾 Cached: ${key} (expires in ${Math.round(duration / 1000 / 60)} minutes)`);
    } catch (error) {
      console.error('Error storing in cache:', error);
      // If localStorage is full, try to clean old cache
      this.cleanExpiredCache();
    }
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const stored = localStorage.getItem(cacheKey);
      
      if (!stored) {
        return null;
      }
      
      const cacheEntry: CacheEntry<T> = JSON.parse(stored);
      
      // Check if cache has expired
      if (cacheEntry.expiry && Date.now() > cacheEntry.expiry) {
        console.log(`⏰ Cache expired: ${key}`);
        this.remove(key);
        return null;
      }
      
      console.log(`📁 Cache hit: ${key}`);
      return cacheEntry.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Remove data from cache
   */
  remove(key: string): void {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      localStorage.removeItem(cacheKey);
      this.removeFromCacheIndex(key);
      console.log(`🗑️ Removed from cache: ${key}`);
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      localStorage.removeItem(this.INDEX_KEY);
      console.log('🧹 All cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredCache(): void {
    try {
      const keys = Object.keys(localStorage);
      let cleanedCount = 0;
      
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const cacheEntry = JSON.parse(stored);
              if (cacheEntry.expiry && Date.now() > cacheEntry.expiry) {
                localStorage.removeItem(key);
                cleanedCount++;
              }
            } catch (e) {
              // Remove corrupted cache entries
              localStorage.removeItem(key);
              cleanedCount++;
            }
          }
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned ${cleanedCount} expired cache entries`);
      }
    } catch (error) {
      console.error('Error cleaning expired cache:', error);
    }
  }

  /**
   * Update cache index for better tracking
   */
  private updateCacheIndex(key: string): void {
    try {
      const index = this.getCacheIndex();
      // Update timestamp for the key
      if (key === 'stables') {
        index.stables = Date.now();
      } else if (key === 'roles') {
        index.roles = Date.now();
      } else if (key === 'users') {
        index.users = Date.now();
      } else if (key.startsWith('channels_')) {
        const stableId = key.replace('channels_', '');
        index.channels[stableId] = Date.now();
      } else if (key.startsWith('messages_')) {
        const channelId = key.replace('messages_', '');
        index.messages[channelId] = Date.now();
      } else if (key.startsWith('cows_')) {
        const parts = key.replace('cows_', '').split('_');
        const stableId = parts[0];
        const page = parts[1] || '1';
        if (!index.cows[stableId]) {
          index.cows[stableId] = {};
        }
        index.cows[stableId][page] = Date.now();
      } else if (key.startsWith('cow_detail_')) {
        const cowId = key.replace('cow_detail_', '');
        index.cowDetails[cowId] = Date.now();
      } else if (key.startsWith('inventory_')) {
        const stableId = key.replace('inventory_', '');
        index.inventory[stableId] = Date.now();
      } else if (key.startsWith('events_')) {
        const stableId = key.replace('events_', '');
        index.events[stableId] = Date.now();
      } else if (key.startsWith('role_')) {
        const roleId = key.replace('role_', '');
        index.roleDetails[roleId] = Date.now();
      } else if (key.startsWith('user_')) {
        const userId = key.replace('user_', '');
        index.userDetails[userId] = Date.now();
      }
      
      localStorage.setItem(this.INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('Error updating cache index:', error);
    }
  }

  /**
   * Remove key from cache index
   */
  private removeFromCacheIndex(key: string): void {
    try {
      const index = this.getCacheIndex();
      
      if (key === 'stables') {
        index.stables = 0;
      } else if (key === 'roles') {
        index.roles = 0;
      } else if (key === 'users') {
        index.users = 0;
      } else if (key.startsWith('channels_')) {
        const stableId = key.replace('channels_', '');
        delete index.channels[stableId];
      } else if (key.startsWith('messages_')) {
        const channelId = key.replace('messages_', '');
        delete index.messages[channelId];
      } else if (key.startsWith('cows_')) {
        const parts = key.replace('cows_', '').split('_');
        const stableId = parts[0];
        const page = parts[1] || '1';
        if (index.cows[stableId]) {
          delete index.cows[stableId][page];
        }
      } else if (key.startsWith('cow_detail_')) {
        const cowId = key.replace('cow_detail_', '');
        delete index.cowDetails[cowId];
      } else if (key.startsWith('inventory_')) {
        const stableId = key.replace('inventory_', '');
        delete index.inventory[stableId];
      } else if (key.startsWith('events_')) {
        const stableId = key.replace('events_', '');
        delete index.events[stableId];
      } else if (key.startsWith('role_')) {
        const roleId = key.replace('role_', '');
        delete index.roleDetails[roleId];
      } else if (key.startsWith('user_')) {
        const userId = key.replace('user_', '');
        delete index.userDetails[userId];
      }
      
      localStorage.setItem(this.INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('Error removing from cache index:', error);
    }
  }

  /**
   * Get cache index
   */
  private getCacheIndex(): CacheIndex {
    try {
      const stored = localStorage.getItem(this.INDEX_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading cache index:', error);
    }
    
    // Return default index
    return {
      stables: 0,
      channels: {},
      messages: {},
      cows: {},
      cowDetails: {},
      inventory: {},
      events: {},
      roles: 0,
      roleDetails: {},
      users: 0,
      userDetails: {}
    };
  }

  /**
   * Cache-first strategy: Try cache first, then network
   */
  cacheFirst<T>(
    key: string,
    networkCall: () => Observable<T>,
    cacheDuration: number = this.DEFAULT_CACHE_DURATION
  ): Observable<T> {
    const cached = this.get<T>(key);
    
    if (cached) {
      // Return cached data immediately
      console.log(`📁 Cache hit: ${key}`);
      
      // Fetch fresh data in background and update cache
      networkCall().pipe(
        tap(data => this.set(key, data, cacheDuration)),
        catchError(error => {
          // Silently handle background fetch errors
          return of(null);
        })
      ).subscribe();
      
      return of(cached);
    }
    
    // No cache, fetch from network
    console.log(`🌐 Fetching from network: ${key}`);
    return networkCall().pipe(
      tap(data => this.set(key, data, cacheDuration))
    );
  }

  /**
   * Network-first strategy: Try network first, fallback to cache
   */
  networkFirst<T>(
    key: string,
    networkCall: () => Observable<T>,
    cacheDuration: number = this.DEFAULT_CACHE_DURATION
  ): Observable<T> {
    console.log(`🌐 Fetching from network (network-first): ${key}`);
    return networkCall().pipe(
      timeout(10000), // 10 second timeout
      tap(data => {
        console.log(`✅ Network success: ${key}`);
        this.set(key, data, cacheDuration);
      }),
      catchError(error => {
        console.log(`❌ Network error for ${key}:`, error.message || error);
        const cached = this.get<T>(key);
        if (cached) {
          console.log(`📁 Fallback to cache: ${key}`);
          return of(cached);
        }
        console.log(`⚠️ No cache available for ${key}, throwing error`);
        return throwError(() => new Error(`No se pudieron cargar los datos y no hay cache disponible`));
      })
    );
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalEntries: number;
    totalSize: string;
    oldestEntry: string;
    newestEntry: string;
  } {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
    
    let totalSize = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;
    
    cacheKeys.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          totalSize += stored.length;
          const cacheEntry = JSON.parse(stored);
          if (cacheEntry.timestamp < oldestTimestamp) {
            oldestTimestamp = cacheEntry.timestamp;
          }
          if (cacheEntry.timestamp > newestTimestamp) {
            newestTimestamp = cacheEntry.timestamp;
          }
        }
      } catch (e) {
        // Skip corrupted entries
      }
    });
    
    return {
      totalEntries: cacheKeys.length,
      totalSize: this.formatBytes(totalSize),
      oldestEntry: new Date(oldestTimestamp).toLocaleString(),
      newestEntry: new Date(newestTimestamp).toLocaleString()
    };
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}