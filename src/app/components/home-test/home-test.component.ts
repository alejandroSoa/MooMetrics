import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faBell, faSearch, faChevronLeft, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { StableService, Stable, StablesResponse } from '../../services/stable.service';
import { ChannelService, Channel, ChannelsResponse } from '../../services/channel.service';
import { MessageService, Message, MessagesResponse, SendMessageRequest, MessageResponse } from '../../services/message.service';

interface ChatMessage {
  user: string;
  message: string;
  isBot?: boolean;
}

interface ChannelWithMessages extends Channel {
  chatMessages: ChatMessage[];
  messagesLoaded: boolean;
  isLoadingMessages: boolean;
}

interface StableWithChannels extends Stable {
  hasSubItems: boolean;
  isExpanded: boolean;
  channels: ChannelWithMessages[];
  channelsLoaded: boolean;
  isLoadingChannels: boolean;
}

@Component({
  selector: 'app-home-test',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './home-test.component.html',
  styleUrls: ['./home-test.component.css']
})
export class HomeTestComponent implements OnInit {
  // Icons
  faUsers = faUsers;
  faBell = faBell;
  faSearch = faSearch;
  faChevronLeft = faChevronLeft;
  faArrowLeft = faArrowLeft;

  // Component state
  searchTerm: string = '';
  messageInput: string = '';
  isMobileView: boolean = false;
  showChat: boolean = false; // false = show sidebar, true = show chat
  
  // Data
  stables: StableWithChannels[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Current selection
  selectedStableIndex: number = -1;
  selectedChannelIndex: number = -1;
  selectedChannel: ChannelWithMessages | null = null;

  constructor(
    private stableService: StableService,
    private channelService: ChannelService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadStables();
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
  }

  /**
   * Load stables from API
   */
  loadStables() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.stableService.getStables().subscribe({
      next: (response: StablesResponse) => {
        if (response.status === 'success') {
          // Filtrar solo los establos activos
          this.stables = response.data
            .filter(stable => stable.isActive)
            .map(stable => ({
              ...stable,
              hasSubItems: true,
              isExpanded: false,
              channels: [],
              channelsLoaded: false,
              isLoadingChannels: false
            }));
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

  /**
   * Load channels for a specific stable
   */
  loadChannels(stableIndex: number) {
    const stable = this.stables[stableIndex];
    if (stable.channelsLoaded || stable.isLoadingChannels) {
      return;
    }

    stable.isLoadingChannels = true;

    this.channelService.getChannelsByStableId(stable.id).subscribe({
      next: (response: ChannelsResponse) => {
        if (response.status === 'success') {
          // Filtrar solo los canales activos
          stable.channels = response.data.channels
            .filter(channel => channel.isActive)
            .map(channel => ({
              ...channel,
              chatMessages: [],
              messagesLoaded: false,
              isLoadingMessages: false
            }));
          stable.channelsLoaded = true;
        }
        stable.isLoadingChannels = false;
      },
      error: (error) => {
        console.error('Error loading channels for stable', stable.id, ':', error);
        stable.isLoadingChannels = false;
      }
    });
  }

  /**
   * Load messages for a specific channel
   */
  loadMessages(channel: ChannelWithMessages) {
    if (channel.messagesLoaded || channel.isLoadingMessages) {
      return;
    }

    channel.isLoadingMessages = true;

    this.messageService.getMessagesByChannelId(channel.id).subscribe({
      next: (response: MessagesResponse) => {
        if (response.status === 'success') {
          channel.chatMessages = response.data.map(message => ({
            user: message.userName || `Usuario ${message.userId}`,
            message: message.content,
            isBot: message.isBot || false
          }));
          channel.messagesLoaded = true;
        }
        channel.isLoadingMessages = false;
      },
      error: (error) => {
        console.error('Error loading messages for channel', channel.id, ':', error);
        channel.isLoadingMessages = false;
      }
    });
  }

  /**
   * Toggle stable expansion and load channels if needed
   */
  toggleStable(index: number): void {
    this.stables[index].isExpanded = !this.stables[index].isExpanded;
    
    if (this.stables[index].isExpanded && !this.stables[index].channelsLoaded) {
      this.loadChannels(index);
    }
  }

  /**
   * Select a channel and load its messages
   */
  selectChannel(stableIndex: number, channelIndex: number): void {
    // Deactivate all channels in all stables
    this.stables.forEach(stable => {
      stable.channels.forEach(channel => {
        channel.isActive = false;
      });
    });

    // Activate selected channel
    const selectedChannel = this.stables[stableIndex].channels[channelIndex];
    selectedChannel.isActive = true;
    
    this.selectedStableIndex = stableIndex;
    this.selectedChannelIndex = channelIndex;
    this.selectedChannel = selectedChannel;
    
    // Load messages for the selected channel
    this.loadMessages(selectedChannel);
    
    // Show chat on mobile
    if (this.isMobileView) {
      this.showChat = true;
    }
  }

  /**
   * Send a message to the current channel
   */
  sendMessage(): void {
    if (!this.messageInput.trim() || !this.selectedChannel) {
      return;
    }

    const messageRequest: SendMessageRequest = {
      content: this.messageInput.trim()
    };

    this.messageService.sendMessage(this.selectedChannel.id, messageRequest).subscribe({
      next: (response: MessageResponse) => {
        if (response.status === 'success') {
          // Add the new message to the chat
          const newMessage: ChatMessage = {
            user: response.data.userName || `Usuario ${response.data.userId}`,
            message: response.data.content,
            isBot: response.data.isBot || false
          };
          
          this.selectedChannel!.chatMessages.push(newMessage);
          this.messageInput = '';
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
  }

  /**
   * Get current chat messages
   */
  get currentChatMessages(): ChatMessage[] {
    return this.selectedChannel?.chatMessages || [];
  }

  /**
   * Back to channels (mobile only)
   */
  backToChannels(): void {
    this.showChat = false;
  }

  /**
   * Check if mobile view
   */
  checkMobileView(): void {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView) {
      this.showChat = false;
    }
  }
}