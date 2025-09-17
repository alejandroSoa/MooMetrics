import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faBell, faSearch, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

interface ChatMessage {
  user: string;
  time: string;
  message: string;
  isBot?: boolean;
}

interface Channel {
  name: string;
  isActive: boolean;
  chatMessages: ChatMessage[];
}

interface Stable {
  name: string;
  hasSubItems: boolean;
  isExpanded: boolean;
  channels: Channel[];
}

@Component({
  selector: 'app-home-test',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './home-test.component.html',
  styleUrls: ['./home-test.component.css']
})
export class HomeTestComponent {
  searchTerm: string = '';
  messageInput: string = '';
  isMobileView: boolean = false;
  showChat: boolean = false; // false = show sidebar, true = show chat
  
  stables: Stable[] = [
    { 
      name: 'Stable 1', 
      hasSubItems: true, 
      isExpanded: true,
      channels: [
        { 
          name: 'General Chat', 
          isActive: true,
          chatMessages: [
            {
              user: 'MooBot',
              time: '9:15 AM',
              message: 'Welcome to the General Chat! Here you can discuss anything related to Stable 1.',
              isBot: true
            },
            {
              user: 'Alex',
              time: '9:20 AM',
              message: 'Good morning everyone!',
              isBot: false
            }
          ]
        },
        { 
          name: 'Chat Bot', 
          isActive: false,
          chatMessages: [
            {
              user: 'MooBot',
              time: '10:15 AM',
              message: 'Hello everyone! I\'m excited to chat with our AI today! Let\'s explore some cool features and see how it can assist us. Feel free to ask anything! Looking forward to your questions.',
              isBot: true
            },
            {
              user: 'Jami',
              time: '10:22 AM',
              message: 'These features are fantastic!',
              isBot: false
            },
            {
              user: 'Mor',
              time: '10:25 AM',
              message: 'I\'m loving this!',
              isBot: false
            }
          ]
        },
        { 
          name: 'Announcements', 
          isActive: false,
          chatMessages: [
            {
              user: 'Admin',
              time: '8:00 AM',
              message: 'Important updates and announcements will be posted here.',
              isBot: false
            }
          ]
        }
      ]
    },
    { 
      name: 'Stable 2', 
      hasSubItems: true, 
      isExpanded: false,
      channels: [
        { 
          name: 'General Discussion', 
          isActive: false,
          chatMessages: [
            {
              user: 'MooBot',
              time: '11:00 AM',
              message: 'Welcome to Stable 2 General Discussion!',
              isBot: true
            }
          ]
        },
        { 
          name: 'Technical Support', 
          isActive: false,
          chatMessages: [
            {
              user: 'TechBot',
              time: '11:30 AM',
              message: 'Need technical help? Ask here!',
              isBot: true
            }
          ]
        }
      ]
    },
    { 
      name: 'Stable 3', 
      hasSubItems: true, 
      isExpanded: false,
      channels: [
        { 
          name: 'Community Chat', 
          isActive: false,
          chatMessages: [
            {
              user: 'CommunityBot',
              time: '12:00 PM',
              message: 'Welcome to the Stable 3 community!',
              isBot: true
            }
          ]
        },
        { 
          name: 'Events & News', 
          isActive: false,
          chatMessages: [
            {
              user: 'EventBot',
              time: '12:15 PM',
              message: 'Stay updated with the latest events and news!',
              isBot: true
            }
          ]
        }
      ]
    }
  ];
  
  faUsers = faUsers;
  faBell = faBell;
  faArrowLeft = faChevronLeft;
  
  get currentChatMessages(): ChatMessage[] {
    for (let stable of this.stables) {
      const activeChannel = stable.channels.find(channel => channel.isActive);
      if (activeChannel) {
        return activeChannel.chatMessages;
      }
    }
    return [];
  }
  
  toggleStable(index: number) {
    this.stables[index].isExpanded = !this.stables[index].isExpanded;
  }
  
  selectChannel(stableIndex: number, channelIndex: number) {
    // Deactivate all channels in all stables
    this.stables.forEach(stable => {
      stable.channels.forEach(channel => {
        channel.isActive = false;
      });
    });
    
    // Activate the selected channel
    this.stables[stableIndex].channels[channelIndex].isActive = true;
    
    // On mobile, switch to chat view when a channel is selected
    if (window.innerWidth <= 768) {
      this.showChat = true;
    }
  }
  
  backToChannels() {
    this.showChat = false;
  }
  
  sendMessage() {
    if (this.messageInput.trim()) {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Find the active channel and add message to it
      for (let stable of this.stables) {
        const activeChannel = stable.channels.find(channel => channel.isActive);
        if (activeChannel) {
          activeChannel.chatMessages.push({
            user: 'You',
            time: time,
            message: this.messageInput,
            isBot: false
          });
          break;
        }
      }
      
      this.messageInput = '';
    }
  }
}
