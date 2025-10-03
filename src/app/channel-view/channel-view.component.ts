// src/app/channel-view/channel-view.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // for *ngIf, *ngFor
import { FormsModule } from '@angular/forms';    // for [(ngModel)]
import { HttpClientModule, HttpClient } from '@angular/common/http'; // needed for HTTP
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-channel-view',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // <-- HttpClientModule added
  templateUrl: './channel-view.component.html',
  styleUrls: ['./channel-view.component.css']
})
export class ChannelViewComponent {
  channelId!: string;
  username: string = 'Anonymous';
  messages: any[] = [];
  newMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    // Get channel ID from route
    this.channelId = this.route.snapshot.paramMap.get('channelId')!;

    // Get logged-in user's username from backend
    try {
      const user: any = await this.http.get('http://localhost:3000/api/user/current', { withCredentials: true }).toPromise();
      this.username = user.username || 'Anonymous';
    } catch (err) {
      console.error('Failed to get current user:', err);
    }

    // Join the chat channel
    this.chatService.joinChannel(this.channelId, this.username);

    // Subscribe to incoming messages
    this.chatService.onMessage().subscribe(msg => {
      if (msg) this.messages.push(msg);
    });

    // Load chat history
    this.chatService.onHistory().subscribe(history => {
      if (Array.isArray(history)) this.messages = [...history];
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.chatService.sendMessage(this.channelId, this.username, this.newMessage);
    this.newMessage = '';
  }

  ngOnDestroy() {
    this.chatService.leaveChannel(this.channelId, this.username);
  }
}
