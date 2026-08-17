import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../core/services/room.service';
import { Loader } from '../shared/loader/loader';
import { gameRoute, gameVersionFromUrl } from '../core/routing/game-route';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, Loader, RouterLink],
  templateUrl: './home.html',
})
export class Home {
  private readonly rooms = inject(RoomService);
  private readonly router = inject(Router);

  showCreate = false;
  username = '';
  isPlaying = true;
  loading = false;
  error = '';
  get version() { return gameVersionFromUrl(this.router.url); }
  get joinRoute(): string[] { return this.version === 'v2' ? ['/v2', 'join'] : ['/join']; }

  async createRoom(): Promise<void> {
    const username = this.username.trim();
    if (!username) {
      this.error = 'Digite seu nome.';
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const session = await this.rooms.create(username, this.isPlaying, this.version);
      await this.router.navigate(gameRoute(session.gameVersion, session.roomCode));
    } catch (error) {
      this.error = (error as Error).message;
    } finally {
      this.loading = false;
    }
  }
}
