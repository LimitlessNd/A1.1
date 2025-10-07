import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root' // service is provided at root level
})
export class ChatService {
  private socket!: Socket // socket.io client instance
  private messageSubject = new Subject<any>() // subject for incoming messages
  private historySubject = new Subject<any[]>() // subject for chat history

  constructor() {
    // connect to backend socket.io server
    this.socket = io('http://localhost:3000', { withCredentials: true })

    // listen for new messages from server
    this.socket.on('message', (msg: any) => {
      this.messageSubject.next(msg)
    })

    // listen for chat history from server
    this.socket.on('history', (msgs: any[]) => {
      this.historySubject.next(msgs)
    })
  }

  // observable for new messages
  onMessage(): Observable<any> {
    return this.messageSubject.asObservable()
  }

  // observable for chat history
  onHistory(): Observable<any[]> {
    return this.historySubject.asObservable()
  }

  // join a channel
  joinChannel(channelId: string) {
    this.socket.emit('joinChannel', channelId)
  }

  // leave a channel
  leaveChannel(channelId: string) {
    this.socket.emit('leaveChannel', channelId)
  }

  // send a message to a channel
  sendMessage(channelId: string, message: string) {
    this.socket.emit('sendMessage', { channelId, message })
  }
}
