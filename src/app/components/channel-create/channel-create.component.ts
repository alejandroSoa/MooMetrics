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
  IonTextarea
} from '@ionic/angular/standalone';
import { ChannelService, CreateChannelRequest, ChannelResponse } from '../../services/channel.service';
import { StableService, StableResponse } from '../../services/stable.service';

@Component({
  selector: 'app-channel-create',
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
    IonTextarea
  ],
  templateUrl: './channel-create.component.html',
  styleUrls: ['./channel-create.component.css']
})
export class ChannelCreateComponent implements OnInit {
  stableId!: number;
  stableName: string = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Form data
  channelData: CreateChannelRequest = {
    name: '',
    description: '',
    stableId: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private channelService: ChannelService,
    private stableService: StableService
  ) {}

  ngOnInit() {
    // Get stable ID from route parameters
    this.route.params.subscribe(params => {
      this.stableId = +params['stableId'];
      if (this.stableId) {
        // Set stableId in form data
        this.channelData.stableId = this.stableId;
        this.loadStableInfo();
      }
    });
  }

  /**
   * Load stable information to show context
   */
  loadStableInfo() {
    this.stableService.getStableById(this.stableId).subscribe({
      next: (response: StableResponse) => {
        if (response.status === 'success') {
          this.stableName = response.data.name;
        }
      },
      error: (error) => {
        console.error('Error loading stable info:', error);
        // Continue even if we can't load stable name
      }
    });
  }

  /**
   * Create new channel
   */
  createChannel() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate form
    if (!this.channelData.name.trim()) {
      this.errorMessage = 'El nombre del canal es requerido';
      return;
    }

    this.isLoading = true;

    this.channelService.createChannel(this.stableId, this.channelData).subscribe({
      next: (response: ChannelResponse) => {
        this.isLoading = false;
        if (response.status === 'success') {
          this.successMessage = 'Canal creado exitosamente';
          // Navigate back to stables management after a short delay
          setTimeout(() => {
            this.goBack();
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Error al crear el canal';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating channel:', error);
        this.errorMessage = 'Error al crear el canal. Por favor, intente nuevamente.';
      }
    });
  }

  /**
   * Go back to stables management
   */
  goBack() {
    this.router.navigate(['/admin/stables']);
  }

  /**
   * Reset form
   */
  resetForm() {
    this.channelData = {
      name: '',
      description: '',
      stableId: this.stableId
    };
    this.errorMessage = '';
    this.successMessage = '';
  }
}