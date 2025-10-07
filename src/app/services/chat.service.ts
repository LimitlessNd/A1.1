import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket!: Socket;
  private messageSubject = new Subject<any>();
  private historySubject = new Subject<any[]>();

  constructor() {
    this.socket = io('http://localhost:3000', { withCredentials: true });

    this.socket.on('message', (msg: any) => {
      this.messageSubject.next(msg);
    });

    this.socket.on('history', (msgs: any[]) => {
      this.historySubject.next(msgs);
    });
  }

  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  onHistory(): Observable<any[]> {
    return this.historySubject.asObservable();
  }

  joinChannel(channelId: string) {
    this.socket.emit('joinChannel', channelId);
  }

  leaveChannel(channelId: string) {
    this.socket.emit('leaveChannel', channelId);
  }

  sendMessage(channelId: string, message: string) {
    this.socket.emit('sendMessage', { channelId, message });
  }
}
