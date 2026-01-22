import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductImportProgressService {
  private socket!: Socket;

  connect(importId: string) {
    if (this.socket) this.socket.disconnect();

    this.socket = io('http://localhost:9001/import', {
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected', this.socket.id);
      this.socket.emit('join', importId);
    });

    this.socket.on('connect_error', (err) => console.error('❌ Socket error', err));
    this.socket.on('disconnect', (reason) => console.warn('⚠️ Socket disconnected', reason));
  }

  getProgress(): Observable<any> {
    return new Observable((observer) => {
      if (!this.socket) return;
      const handler = (data: any) => observer.next(data);
      this.socket.on('progress', handler);
      return () => this.socket.off('progress', handler);
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}
