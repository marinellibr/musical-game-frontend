import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../core/services/room.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink],
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

  async createRoom(): Promise<void> {
    const username = this.username.trim();
    if (!username) {
      this.error = 'Digite seu nome.';
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const session = await this.rooms.create(username, this.isPlaying);
      await this.router.navigate(['/room', session.roomCode]);
    } catch (error) {
      this.error = (error as Error).message;
    } finally {
      this.loading = false;
    }
  }
}
