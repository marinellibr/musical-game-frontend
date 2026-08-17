import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../core/services/room.service';
import { Loader } from '../shared/loader/loader';

@Component({
  selector: 'app-join-room',
  imports: [FormsModule, Loader, RouterLink],
  templateUrl: './join-room.html',
})
export class JoinRoom {
  private readonly rooms = inject(RoomService);
  private readonly router = inject(Router);

  roomCode = '';
  username = '';
  loading = false;
  error = '';

  normalizeCode(): void {
    this.roomCode = this.roomCode.replace(/\s+/g, '').toUpperCase().slice(0, 4);
  }

  async joinRoom(): Promise<void> {
    this.normalizeCode();
    if (!this.roomCode) {
      this.error = 'Digite o código da sala.';
      return;
    }
    if (!this.username.trim()) {
      this.error = 'Digite seu nome.';
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const session = await this.rooms.join(this.roomCode, this.username.trim());
      await this.router.navigate(['/room', session.roomCode]);
    } catch (error) {
      this.error = (error as Error).message;
    } finally {
      this.loading = false;
    }
  }
}
