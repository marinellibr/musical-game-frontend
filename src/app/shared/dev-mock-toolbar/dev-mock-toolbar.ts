import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DevMockStep, RoomService } from '../../core/services/room.service';
import { GamePhaseRoute } from '../../core/routing/game-route';

interface MockNavigationItem { step: DevMockStep; label: string; route: GamePhaseRoute; }

@Component({
  selector: 'app-dev-mock-toolbar',
  template: `
    @if (rooms.mockEnabled) {
      <aside class="dev-mock-toolbar" aria-label="Navegação do mock local">
        <div><strong>MOCK LOCAL</strong><span>{{ roleLabel }}</span></div>
        <nav>
          @for (item of items; track item.step) {
            <button type="button" [class.active]="rooms.activeMockStep() === item.step" (click)="open(item)">{{ item.label }}</button>
          }
        </nav>
      </aside>
    }
  `,
})
export class DevMockToolbar implements OnInit {
  readonly rooms = inject(RoomService);
  private readonly router = inject(Router);
  readonly items: readonly MockNavigationItem[] = [
    { step: 'LOBBY', label: 'Lobby', route: '' },
    { step: 'THEME_REVEAL', label: 'Tema', route: 'theme' },
    { step: 'CHOOSING', label: 'Escolha', route: 'submission' },
    { step: 'LISTENING', label: 'Audição', route: 'listening' },
    { step: 'LISTENING_YOUTUBE', label: 'YouTube', route: 'listening' },
    { step: 'LISTENING_FINISHED', label: 'Fim · 0', route: 'listening' },
    { step: 'LISTENING_READY_ONE', label: 'Fim · 1', route: 'listening' },
    { step: 'LISTENING_READY_ALL', label: 'Todos → votação', route: 'listening' },
    { step: 'VOTING', label: 'Votação', route: 'voting' },
    { step: 'ROUND_RESULTS', label: 'Rodada', route: 'round-result' },
    { step: 'GAME_RESULTS', label: 'Final', route: 'game-result' },
  ];
  get roleLabel(): string { return this.rooms.mockRole === 'host-only' ? 'HOST ONLY' : this.rooms.mockRole === 'player' ? 'PLAYER' : 'HOST + PLAYER'; }

  async ngOnInit(): Promise<void> {
    await this.rooms.initializeMock();
    if (this.router.url === '/') await this.router.navigate(['/mock', this.roleSegment]);
  }

  open(item: MockNavigationItem): void {
    this.rooms.activateMockStep(item.step);
    const route = this.rooms.activeMockStep() === 'VOTING' ? 'voting' : item.route;
    void this.router.navigate(['/mock', this.roleSegment, ...(route ? [route] : [])]);
  }

  private get roleSegment(): string {
    return this.rooms.mockRole === 'host-only' ? 'host-only' : this.rooms.mockRole === 'player' ? 'player' : 'host';
  }
}
