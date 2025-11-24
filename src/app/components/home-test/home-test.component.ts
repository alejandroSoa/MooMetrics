import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faBell, faSearch, faChevronLeft, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { StableService, Stable, StablesResponse } from '../../services/stable.service';
import { ChannelService, Channel, ChannelsResponse } from '../../services/channel.service';
import { MessageService, Message, MessagesResponse, SendMessageRequest, MessageResponse } from '../../services/message.service';
import { CowService, CowsListResponse, CowDetailResponse, InventoryResponse, EventsResponse, Cow } from '../../services/cow.service';

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
export class HomeTestComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer', { static: false }) private messagesContainer!: ElementRef;
  
  // Icons
  faUsers = faUsers;
  faBell = faBell;
  faSearch = faSearch;
  faChevronLeft = faChevronLeft;
  faArrowLeft = faArrowLeft;
  
  // Auto-scroll control
  private shouldScrollToBottom = false;

  // Component state
  searchTerm: string = '';
  messageInput: string = '';
  isMobileView: boolean = false;
  showChat: boolean = false; // false = show sidebar, true = show chat
  
  // Cow listing pagination
  showCowList: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 7;
  totalPages: number = 0;
  cowsData: Cow[] = [];
  isLoadingCows: boolean = false;
  isLoadingCowDetail: boolean = false;
  isLoadingInventory: boolean = false;
  isLoadingEvents: boolean = false;
  
  // Command system
  showCommands: boolean = false;
  availableCommands: Array<{name: string, description: string}> = [
    { name: '#bot', description: 'Activar chatbot con opciones' }
  ];
  
  // Bot system
  showBotMenu: boolean = false;
  botMode: boolean = false; // Indicates if we're in bot conversation mode
  botMessages: ChatMessage[] = []; // Temporary bot messages (not saved to channel)
  showCowSearchInput: boolean = false; // For specific cow search
  botOptions: Array<{id: string, label: string, action: string}> = [
    { id: 'inventory', label: '🐄 Inventario General', action: 'showInventory' },
    { id: 'events', label: '📊 Resumen de Eventos', action: 'showEvents' },
    { id: 'cowSearch', label: '🔍 Buscar Vaca Específica', action: 'searchCow' },
    { id: 'close', label: '❌ Cerrar', action: 'closeBot' }
  ];
  
  // Quick access buttons for bot mode
  quickAccessButtons: Array<{id: string, label: string, icon: string, action: string}> = [
    { id: 'inventory', label: 'Inventario Vacas', icon: '🐄', action: 'showInventory' },
    { id: 'events', label: 'Eventos', icon: '📊', action: 'showEvents' },
    { id: 'cowSearch', label: 'Buscar Vaca', icon: '🔍', action: 'searchCow' }
  ];
  
  // Data
  stables: StableWithChannels[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Cache status
  isOnline = navigator.onLine;
  isUsingCache = false;
  
  // Current selection
  selectedStableIndex: number = -1;
  selectedChannelIndex: number = -1;
  selectedChannel: ChannelWithMessages | null = null;

  constructor(
    private stableService: StableService,
    private channelService: ChannelService,
    private messageService: MessageService,
    private cowService: CowService
  ) {}

  ngOnInit() {
    this.loadStables();
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
  }
  

  
  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
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
   * Handle input changes to show/hide commands
   */
  onInputChange(): void {
    if (this.messageInput.startsWith('#')) {
      this.showCommands = true;
      this.showBotMenu = false;
    } else {
      this.showCommands = false;
    }
  }

  /**
   * Execute a command
   */
  executeCommand(command: string): void {
    this.messageInput = '';
    this.showCommands = false;
    
    if (command === '#bot') {
      this.activateBot();
    }
  }

  /**
   * Activate bot with options menu
   */
  activateBot(): void {
    if (!this.selectedChannel) return;
    
    // Enter bot mode
    this.botMode = true;
    this.botMessages = []; // Clear previous bot conversation
    
    const botMessage: ChatMessage = {
      user: 'MooBot 🤖',
      message: '¡Hola! Soy MooBot, tu asistente virtual. ¿En qué puedo ayudarte?',
      isBot: true
    };
    
    this.botMessages.push(botMessage);
    this.triggerScrollToBottom();
    
    // Show menu after a short delay to ensure message is displayed first
    setTimeout(() => {
      this.showBotMenu = true;
    }, 300);
  }

  /**
   * Handle bot option selection
   */
  selectBotOption(option: {id: string, label: string, action: string}): void {
    if (!this.selectedChannel) return;
    
    // Put the option text in the input automatically
    this.messageInput = option.label;
    this.showBotMenu = false;
    
    // Process the bot interaction in temporary mode
    setTimeout(() => {
      this.processBotInteraction(option);
    }, 100);
  }
  
  /**
   * Handle quick access button selection
   */
  selectQuickAction(button: {id: string, label: string, icon: string, action: string}): void {
    if (!this.selectedChannel) return;
    
    // Add user action message first
    const userMessage: ChatMessage = {
      user: 'Tú',
      message: `${button.icon} ${button.label}`,
      isBot: false
    };
    this.botMessages.push(userMessage);
    this.triggerScrollToBottom();
    
    // Convert to bot option format and process
    const option = {
      id: button.id,
      label: `${button.icon} ${button.label}`,
      action: button.action
    };
    
    // Process the bot interaction directly without showing in input
    setTimeout(() => {
      this.processBotInteractionQuick(option);
    }, 100);
  }
  
  /**
   * Process bot interaction for quick access buttons (user message already added)
   */
  processBotInteractionQuick(option: {id: string, label: string, action: string}): void {
    // Handle bot response based on action (without adding user message)
    let botResponse = '';
    switch(option.action) {
      case 'showInventory':
        this.loadInventoryReport();
        return; // Exit early, response will be handled in the service call
      case 'showEvents':
        this.loadEventsReport();
        return; // Exit early, response will be handled in the service call
      case 'searchCow':
        this.loadCowsList(1);
        return; // Exit early, response will be handled in the service call
      case 'closeBot':
        botResponse = '👋 ¡Hasta luego! Si necesitas ayuda, escribe #bot para activarme de nuevo.';
        this.botMode = false;
        this.botMessages = [];
        this.messageInput = '';
        this.showCowSearchInput = false;
        return;
    }
    
    if (botResponse) {
      setTimeout(() => {
        const botMessage: ChatMessage = {
          user: 'MooBot',
          message: botResponse,
          isBot: true
        };
        this.botMessages.push(botMessage);
        this.triggerScrollToBottom();
        
        // Show menu again for more interactions (except when searching cow or closing)
        if (option.action !== 'closeBot' && option.action !== 'searchCow') {
          setTimeout(() => {
            const followUpMessage: ChatMessage = {
              user: 'MooBot 🤖',
              message: '¿Hay algo más en lo que pueda ayudarte?',
              isBot: true
            };
            this.botMessages.push(followUpMessage);
            this.triggerScrollToBottom();
            this.showBotMenu = true;
          }, 1000);
        }
      }, 500);
    }
  }
  
  /**
   * Process bot interaction in temporary mode (not saved to channel)
   */
  processBotInteraction(option: {id: string, label: string, action: string}): void {
    // Add user selection message to temporary bot chat
    const userMessage: ChatMessage = {
      user: 'Tú',
      message: option.label,
      isBot: false
    };
    this.botMessages.push(userMessage);
    this.triggerScrollToBottom();
    
    // Handle bot response based on action
    let botResponse = '';
    switch(option.action) {
      case 'showInventory':
        this.loadInventoryReport();
        return; // Exit early, response will be handled in the service call
      case 'showEvents':
        this.loadEventsReport();
        return; // Exit early, response will be handled in the service call
      case 'searchCow':
        this.loadCowsList(1);
        return; // Exit early, response will be handled in the service call
      case 'closeBot':
        botResponse = '👋 ¡Hasta luego! Si necesitas ayuda, escribe #bot para activarme de nuevo.';
        this.botMode = false;
        this.botMessages = [];
        this.messageInput = '';
        this.showCowSearchInput = false;
        return;
    }
    
    if (botResponse) {
      setTimeout(() => {
        const botMessage: ChatMessage = {
          user: 'MooBot',
          message: botResponse,
          isBot: true
        };
        this.botMessages.push(botMessage);
        this.triggerScrollToBottom();
        
        // Show menu again for more interactions (except when searching cow or closing)
        if (option.action !== 'closeBot' && option.action !== 'searchCow') {
          setTimeout(() => {
            const followUpMessage: ChatMessage = {
              user: 'MooBot 🤖',
              message: '¿Hay algo más en lo que pueda ayudarte?',
              isBot: true
            };
            this.botMessages.push(followUpMessage);
            this.triggerScrollToBottom();
            this.showBotMenu = true;
          }, 1000);
        }
      }, 500);
    }
  }
  
  /**
   * Send a message to the current channel
   */
  sendMessage(): void {
    if (!this.messageInput.trim() || !this.selectedChannel) {
      return;
    }

    // Check if it's a command
    if (this.messageInput.startsWith('#')) {
      const command = this.messageInput.trim();
      this.executeCommand(command);
      return;
    }
    
    // If in bot mode and showing cow list, handle navigation and selection
    if (this.botMode && this.showCowList) {
      const input = this.messageInput.trim().toLowerCase();
      this.messageInput = '';
      
      // Add user input message
      const userMessage: ChatMessage = {
        user: 'Tú',
        message: input,
        isBot: false
      };
      this.botMessages.push(userMessage);
      this.triggerScrollToBottom();
      
      setTimeout(() => {
        this.processCowListInput(input);
      }, 500);
      
      return;
    }
    
    // If in bot mode and searching for cow, process search
    if (this.botMode && this.showCowSearchInput) {
      const searchTerm = this.messageInput.trim();
      this.messageInput = '';
      
      // Add user search message
      const userMessage: ChatMessage = {
        user: 'Tú',
        message: `Buscar: ${searchTerm}`,
        isBot: false
      };
      this.botMessages.push(userMessage);
      this.triggerScrollToBottom();
      
      setTimeout(() => {
        this.processCowSearch(searchTerm);
      }, 500);
      
      return;
    }
    
    // If in bot mode, don't send to API, just clear input
    if (this.botMode) {
      this.messageInput = '';
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
          this.triggerScrollToBottom();
          this.messageInput = '';
          this.showCommands = false;
          this.showBotMenu = false;
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
  }

  /**
   * Get current chat messages (bot messages if in bot mode, otherwise channel messages)
   */
  get currentChatMessages(): ChatMessage[] {
    if (this.botMode) {
      return this.botMessages;
    }
    return this.selectedChannel?.chatMessages || [];
  }

  /**
   * Back to channels (mobile only)
   */
  backToChannels(): void {
    this.showChat = false;
  }

  /**
   * Generate inventory report from API response
   */
  generateInventoryReportFromAPI(data: any): string {
    let report = `🐄 INVENTARIO GENERAL - ${data.stableName}\n\n`;
    
    report += `📊 RESUMEN TOTAL:\n`;
    report += `• Total de vacas: ${data.summary.totalCows}\n`;
    report += `• Hembras (F): ${data.summary.females}\n`;
    report += `• Machos (M): ${data.summary.males}\n\n`;
    
    report += `🏷️ POR RAZA:\n`;
    data.byBreed.forEach((breed: any) => {
      report += `• ${breed.breed}: ${breed.count} vacas\n`;
    });
    report += '\n';
    
    report += `📅 POR EDAD:\n`;
    data.byAge.forEach((age: any) => {
      report += `• ${age.ageRange}: ${age.count} animales\n`;
    });
    report += '\n';
    
    report += `📍 ESTADO ACTUAL:\n`;
    data.byStatus.forEach((status: any) => {
      report += `• ${status.status}: ${status.count}\n`;
    });
    
    return report;
  }

  /**
   * Generate events report from API response
   */
  generateEventsReportFromAPI(data: any): string {
    let report = `📊 RESUMEN DE EVENTOS - ${data.stableName}\n\n`;
    report += `📈 ${data.period.toUpperCase()}:\n\n`;
    
    report += `🩺 EVENTOS VETERINARIOS:\n`;
    data.veterinaryEvents.forEach((event: any) => {
      report += `• ${event.type}: ${event.count} eventos\n`;
    });
    report += '\n';
    
    report += `🐄 EVENTOS REPRODUCTIVOS:\n`;
    data.reproductiveEvents.forEach((event: any) => {
      report += `• ${event.type}: ${event.count} eventos\n`;
    });
    report += '\n';
    
    report += `🏥 MANEJO:\n`;
    data.managementEvents.forEach((event: any) => {
      report += `• ${event.type}: ${event.count} eventos\n`;
    });
    report += '\n';
    
    report += `📊 TOTAL EVENTOS: ${data.totalEvents}`;
    
    return report;
  }
  
  /**
   * Generate cow report from API response
   */
  generateCowReportFromAPI(cow: Cow): string {
    let report = `🔍 INFORMACIÓN DE VACA - ID: ${cow.id}\n\n`;
    
    report += `📋 DATOS BÁSICOS:\n`;
    report += `• PKY: ${cow.id}\n`;
    report += `• Nombre: ${cow.name}\n`;
    report += `• Establo: ${cow.barnName}\n`;
    report += `• Sexo: ${cow.sex === 'F' ? 'Hembra (F)' : 'Macho (M)'}\n`;
    report += `• Raza: ${cow.breed}\n`;
    report += `• Fecha nacimiento: ${cow.birthDate}\n`;
    report += `• Edad: ${cow.age}\n\n`;
    
    if (cow.events) {
      report += `📊 EVENTOS REGISTRADOS:\n`;
      report += `• Diagnósticos: ${cow.events.diagnoses} eventos\n`;
      if (cow.events.pregnancyChecks > 0) {
        report += `• Chequeos embarazo: ${cow.events.pregnancyChecks} eventos\n`;
      }
      if (cow.events.breedings > 0) {
        report += `• Cruces: ${cow.events.breedings} eventos\n`;
      }
      report += `• Tratamientos: ${cow.events.treatments} eventos\n`;
      if (cow.events.births > 0) {
        report += `• Nacimientos: ${cow.events.births} eventos\n`;
      }
      report += '\n';
    }
    
    if (cow.lastEvent) {
      report += `🏥 ÚLTIMO EVENTO:\n`;
      report += `• Tipo: ${cow.lastEvent.type}\n`;
      report += `• Fecha: ${cow.lastEvent.date}\n`;
      report += `• Técnico: ${cow.lastEvent.technician}\n`;
      report += `• Estado: ${cow.lastEvent.status}\n\n`;
    }
    
    if (cow.sex === 'F' && cow.lactationNumber && cow.daysInMilk && cow.dailyProduction) {
      report += `📈 ESTADO ACTUAL:\n`;
      report += `• Lactancia: ${cow.lactationNumber}° lactancia\n`;
      report += `• Días en leche: ${cow.daysInMilk}\n`;
      report += `• Producción: ${cow.dailyProduction} L/día`;
    }
    
    return report;
  }

  /**
   * Load cows list from API service
   */
  loadCowsList(page: number): void {
    if (!this.selectedChannel) return;
    
    this.isLoadingCows = true;
    this.currentPage = page;
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      user: 'MooBot 🤖',
      message: '🔄 Cargando listado de vacas...',
      isBot: true
    };
    this.botMessages.push(loadingMessage);
    this.triggerScrollToBottom();
    
    // Get current stable ID
    const currentStableId = this.stables[this.selectedStableIndex]?.id || 1;
    
    // Call API service
    this.cowService.getCowsByStableId(currentStableId, page, this.itemsPerPage).subscribe({
      next: (response: CowsListResponse) => {
        this.isLoadingCows = false;
        
        if (response.status === 'success') {
          this.cowsData = response.data.cows;
          this.totalPages = response.data.pagination.totalPages;
          this.showCowList = true;
          
          // Remove loading message and add cow list
          this.botMessages.pop(); // Remove loading message
          
          const listMessage = this.generateCowListMessage(response.data.cows, response.data.pagination);
          const botMessage: ChatMessage = {
            user: 'MooBot 🤖',
            message: listMessage,
            isBot: true
          };
          this.botMessages.push(botMessage);
          this.triggerScrollToBottom();
        } else {
          this.botMessages.pop(); // Remove loading message
          const errorMessage: ChatMessage = {
            user: 'MooBot 🤖',
            message: `❌ Error: ${response.message}`,
            isBot: true
          };
          this.botMessages.push(errorMessage);
          this.triggerScrollToBottom();
        }
      },
      error: (error) => {
        this.isLoadingCows = false;
        this.botMessages.pop(); // Remove loading message
        
        console.error('Error loading cows:', error);
        const errorMessage: ChatMessage = {
          user: 'MooBot 🤖',
          message: '❌ Error al cargar el listado de vacas. Intenta nuevamente.',
          isBot: true
        };
        this.botMessages.push(errorMessage);
        this.triggerScrollToBottom();
      }
    });
  }
  
  /**
   * Generate cow list message from API response
   */
  generateCowListMessage(cows: Cow[], pagination: any): string {
    let listMessage = `🐄 LISTADO DE VACAS DISPONIBLES\n\n`;
    listMessage += `📄 Página ${pagination.currentPage} de ${pagination.totalPages}\n`;
    listMessage += `📊 Total: ${pagination.totalItems} vacas\n\n`;
    
    cows.forEach((cow, index) => {
      const displayNumber = ((pagination.currentPage - 1) * pagination.itemsPerPage) + index + 1;
      listMessage += `${displayNumber}. ${cow.id} - ${cow.name}\n`;
      listMessage += `   Raza: ${cow.breed} | Edad: ${cow.age} | Sexo: ${cow.sex}\n\n`;
    });
    
    listMessage += `📋 COMANDOS DISPONIBLES:\n`;
    if (pagination.currentPage > 1) listMessage += `• "anterior" - Página anterior\n`;
    if (pagination.currentPage < pagination.totalPages) listMessage += `• "siguiente" - Página siguiente\n`;
    listMessage += `• "página X" - Ir a página específica (ej: página 5)\n`;
    listMessage += `• Escribe el PKY de la vaca para ver detalles (ej: PKY001)\n`;
    listMessage += `• "salir" - Volver al menú principal`;
    
    return listMessage;
  }
  
  /**
   * Process cow list input (navigation and selection)
   */
  processCowListInput(input: string): void {
    let botResponse = '';
    
    if (input === 'siguiente' && this.currentPage < this.totalPages) {
      this.loadCowsList(this.currentPage + 1);
      return; // Exit early
    } else if (input === 'anterior' && this.currentPage > 1) {
      this.loadCowsList(this.currentPage - 1);
      return; // Exit early
    } else if (input.startsWith('página ')) {
      const pageNum = parseInt(input.replace('página ', ''));
      if (pageNum >= 1 && pageNum <= this.totalPages) {
        this.loadCowsList(pageNum);
        return; // Exit early
      } else {
        botResponse = `❌ Página no válida. Por favor ingresa un número entre 1 y ${this.totalPages}.`;
      }
    } else if (input.startsWith('pky') && input.length >= 6) {
      // User selected a specific cow
      const cowId = input.toUpperCase();
      this.loadCowDetail(cowId);
      return; // Exit early
    } else if (input === 'salir') {
      botResponse = '👋 Regresando al menú principal...';
      this.showCowList = false;
      setTimeout(() => {
        const menuMessage: ChatMessage = {
          user: 'MooBot 🤖',
          message: '¿En qué más puedo ayudarte?',
          isBot: true
        };
        this.botMessages.push(menuMessage);
        this.triggerScrollToBottom();
        this.showBotMenu = true;
      }, 1000);
    } else {
      botResponse = `❌ Comando no reconocido. Usa:\n• "siguiente" / "anterior"\n• "página X"\n• PKY de la vaca (ej: PKY001)\n• "salir"`;
    }
    
    if (botResponse) {
      setTimeout(() => {
        const botMessage: ChatMessage = {
          user: 'MooBot 🤖',
          message: botResponse,
          isBot: true
        };
        this.botMessages.push(botMessage);
        this.triggerScrollToBottom();
        
        // Show menu again if we're not in cow list mode and not showing specific cow
        if (!this.showCowList && !botResponse.includes('INFORMACIÓN DE VACA')) {
          setTimeout(() => {
            const followUpMessage: ChatMessage = {
              user: 'MooBot 🤖',
              message: '¿Hay algo más en lo que pueda ayudarte?',
              isBot: true
            };
            this.botMessages.push(followUpMessage);
            this.triggerScrollToBottom();
            this.showBotMenu = true;
          }, 1000);
        }
      }, 500);
    }
  }
  
  /**
   * Load cow detail from API service
   */
  loadCowDetail(cowId: string): void {
    this.isLoadingCowDetail = true;
    this.showCowList = false;
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      user: 'MooBot 🤖',
      message: `🔄 Cargando información de ${cowId}...`,
      isBot: true
    };
    this.botMessages.push(loadingMessage);
    this.triggerScrollToBottom();
    
    this.cowService.getCowDetail(cowId).subscribe({
      next: (response: CowDetailResponse) => {
        this.isLoadingCowDetail = false;
        this.botMessages.pop(); // Remove loading message
        
        if (response.status === 'success') {
          const cowReport = this.generateCowReportFromAPI(response.data);
          const botMessage: ChatMessage = {
            user: 'MooBot 🤖',
            message: cowReport,
            isBot: true
          };
          this.botMessages.push(botMessage);
          this.triggerScrollToBottom();
          
          // Show menu again after a delay
          setTimeout(() => {
            const followUpMessage: ChatMessage = {
              user: 'MooBot 🤖',
              message: '¿Deseas consultar otra vaca o necesitas algo más?',
              isBot: true
            };
            this.botMessages.push(followUpMessage);
            this.triggerScrollToBottom();
            this.showBotMenu = true;
          }, 1000);
        } else {
          const errorMessage: ChatMessage = {
            user: 'MooBot 🤖',
            message: `❌ ${response.message}`,
            isBot: true
          };
          this.botMessages.push(errorMessage);
          this.triggerScrollToBottom();
        }
      },
      error: (error) => {
        this.isLoadingCowDetail = false;
        this.botMessages.pop(); // Remove loading message
        
        console.error('Error loading cow detail:', error);
        const errorMessage: ChatMessage = {
          user: 'MooBot 🤖',
          message: `❌ Error al cargar información de ${cowId}. Intenta nuevamente.`,
          isBot: true
        };
        this.botMessages.push(errorMessage);
        this.triggerScrollToBottom();
      }
    });
  }
  
  /**
   * Load inventory report from API service
   */
  loadInventoryReport(): void {
    this.isLoadingInventory = true;
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      user: 'MooBot 🤖',
      message: '🔄 Generando reporte de inventario...',
      isBot: true
    };
    this.botMessages.push(loadingMessage);
    this.triggerScrollToBottom();
    
    // Get current stable ID
    const currentStableId = this.stables[this.selectedStableIndex]?.id || 1;
    
    this.cowService.getInventoryByStableId(currentStableId).subscribe({
      next: (response: InventoryResponse) => {
        this.isLoadingInventory = false;
        this.botMessages.pop(); // Remove loading message
        
        if (response.status === 'success') {
          const inventoryReport = this.generateInventoryReportFromAPI(response.data);
          const botMessage: ChatMessage = {
            user: 'MooBot 🤖',
            message: inventoryReport,
            isBot: true
          };
          this.botMessages.push(botMessage);
          this.triggerScrollToBottom();
          
          // Show follow-up message and menu
          setTimeout(() => {
            const followUpMessage: ChatMessage = {
              user: 'MooBot 🤖',
              message: '¿Hay algo más en lo que pueda ayudarte?',
              isBot: true
            };
            this.botMessages.push(followUpMessage);
            this.triggerScrollToBottom();
            this.showBotMenu = true;
          }, 1000);
        } else {
          const errorMessage: ChatMessage = {
            user: 'MooBot 🤖',
            message: `❌ Error: ${response.message}`,
            isBot: true
          };
          this.botMessages.push(errorMessage);
          this.triggerScrollToBottom();
        }
      },
      error: (error) => {
        this.isLoadingInventory = false;
        this.botMessages.pop(); // Remove loading message
        
        console.error('Error loading inventory:', error);
        const errorMessage: ChatMessage = {
          user: 'MooBot 🤖',
          message: '❌ Error al generar el reporte de inventario. Intenta nuevamente.',
          isBot: true
        };
        this.botMessages.push(errorMessage);
        this.triggerScrollToBottom();
      }
    });
  }
  
  /**
   * Load events report from API service
   */
  loadEventsReport(): void {
    this.isLoadingEvents = true;
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      user: 'MooBot 🤖',
      message: '🔄 Generando reporte de eventos...',
      isBot: true
    };
    this.botMessages.push(loadingMessage);
    this.triggerScrollToBottom();
    
    // Get current stable ID
    const currentStableId = this.stables[this.selectedStableIndex]?.id || 1;
    
    this.cowService.getEventsByStableId(currentStableId).subscribe({
      next: (response: EventsResponse) => {
        this.isLoadingEvents = false;
        this.botMessages.pop(); // Remove loading message
        
        if (response.status === 'success') {
          const eventsReport = this.generateEventsReportFromAPI(response.data);
          const botMessage: ChatMessage = {
            user: 'MooBot 🤖',
            message: eventsReport,
            isBot: true
          };
          this.botMessages.push(botMessage);
          this.triggerScrollToBottom();
          
          // Show follow-up message and menu
          setTimeout(() => {
            const followUpMessage: ChatMessage = {
              user: 'MooBot 🤖',
              message: '¿Hay algo más en lo que pueda ayudarte?',
              isBot: true
            };
            this.botMessages.push(followUpMessage);
            this.triggerScrollToBottom();
            this.showBotMenu = true;
          }, 1000);
        } else {
          const errorMessage: ChatMessage = {
            user: 'MooBot 🤖',
            message: `❌ Error: ${response.message}`,
            isBot: true
          };
          this.botMessages.push(errorMessage);
          this.triggerScrollToBottom();
        }
      },
      error: (error) => {
        this.isLoadingEvents = false;
        this.botMessages.pop(); // Remove loading message
        
        console.error('Error loading events:', error);
        const errorMessage: ChatMessage = {
          user: 'MooBot 🤖',
          message: '❌ Error al generar el reporte de eventos. Intenta nuevamente.',
          isBot: true
        };
        this.botMessages.push(errorMessage);
        this.triggerScrollToBottom();
      }
    });
  }
  
  /**
   * Process cow search input
   */
  processCowSearch(searchTerm: string): void {
    // Mock cow data search
    const cowData = this.generateCowReport(searchTerm);
    
    const botMessage: ChatMessage = {
      user: 'MooBot 🤖',
      message: cowData,
      isBot: true
    };
    this.botMessages.push(botMessage);
    this.triggerScrollToBottom();
    
    this.showCowSearchInput = false;
    
    // Show menu again
    setTimeout(() => {
      const followUpMessage: ChatMessage = {
        user: 'MooBot 🤖',
        message: '¿Deseas consultar otra vaca o necesitas algo más?',
        isBot: true
      };
      this.botMessages.push(followUpMessage);
      this.triggerScrollToBottom();
      this.showBotMenu = true;
    }, 1000);
  }

  /**
   * Generate individual cow report
   */
  generateCowReport(searchTerm: string): string {
    return `🔍 INFORMACIÓN DE VACA - ID: ${searchTerm}\n\n` +
           `📋 DATOS BÁSICOS:\n` +
           `• PKY: ${searchTerm}\n` +
           `• Establo: ${this.stables[this.selectedStableIndex]?.name || 'MSD-001'}\n` +
           `• Sexo: Hembra (F)\n` +
           `• Raza: Holstein\n` +
           `• Fecha nacimiento: 15/03/2021\n` +
           `• Edad: 3 años 8 meses\n\n` +
           `📊 EVENTOS REGISTRADOS:\n` +
           `• Diagnósticos: 8 eventos\n` +
           `• Chequeos embarazo: 5 eventos\n` +
           `• Cruces: 3 eventos\n` +
           `• Tratamientos: 2 eventos\n` +
           `• Nacimientos: 2 eventos\n\n` +
           `🏥 ÚLTIMO EVENTO:\n` +
           `• Tipo: Chequeo embarazo\n` +
           `• Fecha: 18/11/2024\n` +
           `• Técnico: Dr. García\n` +
           `• Estado: Gestante - 45 días\n\n` +
           `📈 ESTADO ACTUAL:\n` +
           `• Lactancia: 2° lactancia\n` +
           `• Días en leche: 156\n` +
           `• Producción: 28.5 L/día`;
  }

  /**
   * Exit bot mode and return to normal chat
   */
  exitBotMode(): void {
    this.botMode = false;
    this.botMessages = [];
    this.showBotMenu = false;
    this.showCowSearchInput = false;
    this.showCowList = false;
    this.currentPage = 1;
    this.cowsData = [];
    this.totalPages = 0;
    this.isLoadingCows = false;
    this.isLoadingCowDetail = false;
    this.isLoadingInventory = false;
    this.isLoadingEvents = false;
    this.messageInput = '';
  }
  
  /**
   * Scroll to bottom of messages container
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer && this.messagesContainer.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
  
  /**
   * Trigger scroll to bottom after next view check
   */
  private triggerScrollToBottom(): void {
    this.shouldScrollToBottom = true;
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