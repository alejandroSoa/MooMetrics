import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonToggle,
  IonTextarea
} from '@ionic/angular/standalone';
import { ChannelService, Channel, ChannelResponse, UpdateChannelRequest } from '../../services/channel.service';

@Component({
  selector: 'app-channel-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSpinner,
    IonButtons,
    IonBackButton,
    IonToggle,
    IonTextarea
  ],
  templateUrl: './channel-detail.component.html',
  styleUrls: ['./channel-detail.component.css']
})
export class ChannelDetailComponent implements OnInit {
  channelId!: number;
  channel: Channel | null = null;
  originalChannel: Channel | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private channelService: ChannelService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.channelId = +params['id'];
      if (this.channelId) {
        this.loadChannel();
      }
    });
  }

  /**
   * Load channel data
   */
  loadChannel() {
    this.isLoading = true;
    this.errorMessage = '';

    this.channelService.getChannelById(this.channelId).subscribe({
      next: (response: ChannelResponse) => {
        this.isLoading = false;
        if (response.status === 'success') {
          this.channel = { ...response.data };
          this.originalChannel = { ...response.data };
        } else {
          this.errorMessage = response.message || 'Error al cargar el canal';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading channel:', error);
        this.errorMessage = 'Error al cargar la información del canal';
      }
    });
  }

  /**
   * Save channel changes
   */
  saveChannel() {
    if (!this.channel || !this.isFormValid()) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData: UpdateChannelRequest = {
      name: this.channel.name.trim(),
      description: this.channel.description?.trim(),
      isActive: this.channel.isActive
    };

    this.channelService.updateChannel(this.channelId, updateData).subscribe({
      next: (response: ChannelResponse) => {
        this.isSaving = false;
        if (response.status === 'success') {
          this.successMessage = 'Canal actualizado exitosamente';
          
          // Redirect to stables management after successful update
          setTimeout(() => {
            this.router.navigate(['/admin/stables']);
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Error al actualizar el canal';
        }
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error updating channel:', error);
        this.errorMessage = 'Error al actualizar el canal. Por favor, intente nuevamente.';
      }
    });
  }

  /**
   * Cancel edit and restore original values
   */
  cancelEdit() {
    if (this.originalChannel) {
      this.channel = { ...this.originalChannel };
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return !!(this.channel?.name?.trim().length && this.channel.name.trim().length > 0);
  }

  /**
   * Check if there are changes to save
   */
  hasChanges(): boolean {
    if (!this.channel || !this.originalChannel) {
      return false;
    }

    return (
      this.channel.name.trim() !== this.originalChannel.name ||
      (this.channel.description?.trim() || '') !== (this.originalChannel.description || '') ||
      this.channel.isActive !== this.originalChannel.isActive
    );
  }

  /**
   * Get channel status text
   */
  getChannelStatusText(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  /**
   * Go back to stables management
   */
  goBack() {
    this.router.navigate(['/admin/stables']);
  }
}