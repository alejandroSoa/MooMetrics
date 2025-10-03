import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminModeService {
  private readonly ADMIN_MODE_KEY = 'moo_admin_mode';
  
  private isAdminModeSubject = new BehaviorSubject<boolean>(this.getStoredAdminMode());
  public isAdminMode$ = this.isAdminModeSubject.asObservable();

  constructor() {}

  /**
   * Get stored admin mode from localStorage
   */
  private getStoredAdminMode(): boolean {
    const stored = localStorage.getItem(this.ADMIN_MODE_KEY);
    return stored === 'true';
  }

  /**
   * Toggle admin mode
   */
  toggleAdminMode(): void {
    const currentMode = this.isAdminModeSubject.value;
    const newMode = !currentMode;
    
    // Update localStorage
    localStorage.setItem(this.ADMIN_MODE_KEY, newMode.toString());
    
    // Update observable
    this.isAdminModeSubject.next(newMode);
  }

  /**
   * Get current admin mode status
   */
  isAdminMode(): boolean {
    return this.isAdminModeSubject.value;
  }

  /**
   * Get admin mode status as observable
   */
  getAdminModeStatus(): Observable<boolean> {
    return this.isAdminMode$;
  }

  /**
   * Set admin mode explicitly
   */
  setAdminMode(isAdmin: boolean): void {
    localStorage.setItem(this.ADMIN_MODE_KEY, isAdmin.toString());
    this.isAdminModeSubject.next(isAdmin);
  }
}