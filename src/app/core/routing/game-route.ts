export type GamePhaseRoute = '' | 'theme' | 'submission' | 'waiting' | 'listening' | 'voting' | 'round-result' | 'scoreboard' | 'game-result' | 'summary';

export function gameRoute(roomCode: string, phase: GamePhaseRoute = ''): string[] {
  const route = ['/room', roomCode];
  return phase ? [...route, phase] : route;
}

export function homeRoute(): string[] { return ['/']; }
