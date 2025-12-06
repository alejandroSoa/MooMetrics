import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faSignal, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonButtons,
  IonButton,
  IonIcon,
  ViewWillEnter
} from '@ionic/angular/standalone';
import { StableService, Stable, StablesResponse } from '../../services/stable.service';
import { ChannelService, Channel, ChannelsResponse } from '../../services/channel.service';

@Component({
  selector: 'app-stables-management',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonButtons,
    IonButton
  ],
  templateUrl: './stables-management.component.html',
  styleUrls: ['./stables-management.component.css']
})
export class StablesManagementComponent implements OnInit, ViewWillEnter {
  // FontAwesome icons
  faPlus = faPlus;
  faSignal = faSignal;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  stables: Stable[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Channels data
  channels: { [stableId: number]: Channel[] } = {};
  isChannelsExpanded: { [stableId: number]: boolean } = {};
  loadingChannels: { [stableId: number]: boolean } = {};
  channelsError: { [stableId: number]: string } = {};

  constructor(
    private stableService: StableService, 
    private channelService: ChannelService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initial load is handled by ionViewWillEnter
  }

  ionViewWillEnter() {
    // This lifecycle hook is called every time the view is entered
    // This ensures the list is refreshed when returning from stable-detail
    this.loadStables();
  }

  loadStables() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.stableService.getStables().subscribe({
      next: (response: StablesResponse) => {
        if (response.status === 'success') {
          this.stables = response.data;
        } else {
          this.errorMessage = response.message || 'Error al cargar los establos';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stables:', error);
        this.errorMessage = 'Error al cargar la lista de establos';
        this.isLoading = false;
      }
    });
  }

  getStableStatusClass(isActive: boolean): string {
    return isActive ? 'stable-active' : 'stable-inactive';
  }

  getStableStatusText(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  viewStableDetail(stableId: number): void {
    this.router.navigate(['/admin/stables', stableId]);
  }

  addNewStable(): void {
    this.router.navigate(['/admin/stables/new']);
  }

  // ==================== Channels Methods ====================

  /**
   * Toggle the expansion of channels section for a stable
   */
  toggleChannels(stableId: number): void {
    this.isChannelsExpanded[stableId] = !this.isChannelsExpanded[stableId];
    
    // Load channels if expanded and not already loaded
    if (this.isChannelsExpanded[stableId] && !this.channels[stableId]) {
      this.loadChannels(stableId);
    }
  }

  /**
   * Load channels for a specific stable
   */
  loadChannels(stableId: number): void {
    this.loadingChannels[stableId] = true;
    this.channelsError[stableId] = '';

    this.channelService.getChannelsByStableId(stableId).subscribe({
      next: (response: ChannelsResponse) => {
        if (response.status === 'success') {
          this.channels[stableId] = response.data.channels;
        } else {
          this.channelsError[stableId] = response.message || 'Error al cargar los canales';
        }
        this.loadingChannels[stableId] = false;
      },
      error: (error) => {
        console.error('Error loading channels for stable', stableId, ':', error);
        this.channelsError[stableId] = 'Error al cargar la lista de canales';
        this.loadingChannels[stableId] = false;
      }
    });
  }

  /**
   * Get channels for a specific stable
   */
  getChannelsForStable(stableId: number): Channel[] {
    return this.channels[stableId] || [];
  }

  /**
   * Get channel status CSS class
   */
  getChannelStatusClass(isActive: boolean): string {
    return isActive ? 'channel-active' : 'channel-inactive';
  }

  /**
   * Get channel status text
   */
  getChannelStatusText(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  /**
   * Navigate to channel detail
   */
  viewChannelDetail(channelId: number): void {
    this.router.navigate(['/admin/channels', channelId, 'detail']);
  }

  /**
   * Add new channel for a stable
   */
  addNewChannel(stableId: number, event: Event): void {
    event.stopPropagation(); // Prevent triggering the toggle
    this.router.navigate(['/admin/channels', stableId]);
  }
}