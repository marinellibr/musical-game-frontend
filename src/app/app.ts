import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RoomService } from './core/services/room.service';
import { Loader } from './shared/loader/loader';
import { DevMockToolbar } from './shared/dev-mock-toolbar/dev-mock-toolbar';

@Component({
  selector: 'app-root',
  imports: [DevMockToolbar, Loader, RouterOutlet],
  template: `<router-outlet />@if (rooms.mockEnabled) { <app-dev-mock-toolbar /> }@if (rooms.connectionState() === 'reconnecting' || rooms.connectionState() === 'disconnected') { <aside class="connection-overlay"><app-loader compact label="Reconectando à sala..." /></aside> }`,
  styleUrl: './app.css',
})
export class App { readonly rooms = inject(RoomService); }
