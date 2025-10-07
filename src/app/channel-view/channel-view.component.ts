import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel-view',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './channel-view.component.html',
  styleUrls: ['./channel-view.component.css']
})
export class ChannelViewComponent implements OnDestroy {
  channelId!: string // current channel ID
  username: string = 'Anonymous' // logged-in username
  messages: any[] = [] // messages for this channel
  newMessage: string = '' // new message input
  private subscriptions: Subscription[] = [] // store RxJS subscriptions

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    this.channelId = this.route.snapshot.paramMap.get('channelId')! // get channelId from route

    // get current user
    try {
      const user: any = await this.http
        .get('http://localhost:3000/api/user/current', { withCredentials: true })
        .toPromise()
      this.username = user.username || 'Anonymous'
    } catch (err) {
      console.error('Failed to get current user:', err)
    }

    // subscribe to chat history (append instead of overwrite)
    const subHistory = this.chatService.onHistory().subscribe(history => {
      this.messages = [...this.messages, ...history]
    })

    // subscribe to incoming messages
    const subMessage = this.chatService.onMessage().subscribe(msg => {
      this.messages.push(msg)
    })

    this.subscriptions.push(subHistory, subMessage)

    // join the channel (triggers server to send join system message)
    this.chatService.joinChannel(this.channelId)
  }

  // send a new message
  sendMessage() {
    if (!this.newMessage.trim()) return
    this.chatService.sendMessage(this.channelId, this.newMessage)
    this.newMessage = ''
  }

  // leave channel and unsubscribe from observables
  ngOnDestroy() {
    this.chatService.leaveChannel(this.channelId)
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
