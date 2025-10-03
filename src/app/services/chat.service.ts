import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket!: Socket;

  constructor() {
    this.socket = io('http://localhost:3000', { withCredentials: true });
  }

  joinChannel(channelId: string, username: string) {
    this.socket.emit('joinChannel', { channelId, username });
  }

  leaveChannel(channelId: string, username: string) {
    this.socket.emit('leaveChannel', { channelId, username });
  }

  sendMessage(channelId: string, username: string, message: string) {
    this.socket.emit('chatMessage', { channelId, username, message });
  }

  onMessage(): Observable<any> {
    return fromEvent(this.socket, 'chatMessage');
  }

  onHistory(): Observable<any> {
    return fromEvent(this.socket, 'history');
  }
}
