import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RoomService } from './core/services/room.service';
import { Loader } from './shared/loader/loader';
import { DevMockToolbar } from './shared/dev-mock-toolbar/dev-mock-toolbar';
import { homeRoute } from './core/routing/game-route';

@Component({
  selector: 'app-root',
  imports: [DevMockToolbar, Loader, RouterOutlet],
  template: `@if (rooms.state()) { <header class="room-app-header"><span>MUSICAL GAME</span><button type="button" (click)="leaveRoom()">SAIR DA SALA</button></header> }<router-outlet />@if (rooms.mockEnabled) { <app-dev-mock-toolbar /> }@if (rooms.connectionState() === 'reconnecting' || rooms.connectionState() === 'disconnected') { <aside class="connection-overlay"><app-loader compact label="Reconectando à sala..." /></aside> }`,
  styleUrl: './app.css',
})
export class App {
  readonly rooms = inject(RoomService);
  private readonly router = inject(Router);

  leaveRoom(): void {
    const version = this.rooms.state()?.gameVersion || 'v1';
    this.rooms.clearSession();
    void this.router.navigate(homeRoute(version));
  }
}
