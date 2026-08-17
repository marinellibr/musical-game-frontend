import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DevMockStep, RoomService } from '../../core/services/room.service';
import { gameRoute, GamePhaseRoute, gameVersionFromUrl } from '../../core/routing/game-route';

interface MockNavigationItem { step: DevMockStep; label: string; route: GamePhaseRoute; }

@Component({
  selector: 'app-dev-mock-toolbar',
  template: `
    @if (rooms.mockEnabled) {
      <aside class="dev-mock-toolbar" aria-label="Navegação do mock local">
        <div><strong>MOCK LOCAL</strong><span>{{ roleLabel }}</span></div>
        <nav>
          @for (item of items; track item.step) {
            <button type="button" [class.active]="rooms.state()?.status === item.step" (click)="open(item)">{{ item.label }}</button>
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
    { step: 'VOTING', label: 'Votação', route: 'voting' },
    { step: 'ROUND_RESULTS', label: 'Rodada', route: 'round-result' },
    { step: 'GAME_RESULTS', label: 'Final', route: 'game-result' },
  ];
  get roleLabel(): string { return this.rooms.mockRole === 'host-only' ? 'HOST ONLY' : this.rooms.mockRole === 'player' ? 'PLAYER' : 'HOST + PLAYER'; }

  async ngOnInit(): Promise<void> {
    const initialVersion = this.router.url === '/' ? 'v2' : gameVersionFromUrl(this.router.url);
    this.rooms.setMockVersion(initialVersion);
    await this.rooms.initializeMock();
    if (this.router.url === '/') await this.router.navigate(gameRoute(initialVersion, this.rooms.state()?.roomCode || 'MOCK'));
  }

  open(item: MockNavigationItem): void {
    this.rooms.activateMockStep(item.step);
    const roomCode = this.rooms.state()?.roomCode || 'MOCK';
    void this.router.navigate(gameRoute(gameVersionFromUrl(this.router.url), roomCode, item.route));
  }
}
