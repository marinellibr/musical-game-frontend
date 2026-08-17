import { GameVersion } from '../models/room.models';

export type GamePhaseRoute = '' | 'theme' | 'submission' | 'waiting' | 'listening' | 'voting' | 'round-result' | 'scoreboard' | 'game-result' | 'summary';

export function gameVersionFromUrl(url: string): GameVersion {
  return url.startsWith('/v2') ? 'v2' : 'v1';
}

export function gameRoute(version: GameVersion, roomCode: string, phase: GamePhaseRoute = ''): string[] {
  const route = version === 'v2' ? ['/v2', 'room', roomCode] : ['/room', roomCode];
  return phase ? [...route, phase] : route;
}

export function homeRoute(version: GameVersion): string[] {
  return version === 'v2' ? ['/v2'] : ['/'];
}
