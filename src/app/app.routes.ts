import { Routes } from '@angular/router';
import { GameResult } from './game-result/game-result';
import { GameSummary } from './game-summary/game-summary';
import { Home } from './home/home';
import { JoinRoom } from './join-room/join-room';
import { Listening } from './listening/listening';
import { Lobby } from './lobby/lobby';
import { RoundResult } from './round-result/round-result';
import { Scoreboard } from './scoreboard/scoreboard';
import { Submission } from './submission/submission';
import { ThemeReveal } from './theme-reveal/theme-reveal';
import { Voting } from './voting/voting';
import { Waiting } from './waiting/waiting';

const phases = [
  { path: '', component: Lobby }, { path: 'theme', component: ThemeReveal },
  { path: 'submission', component: Submission }, { path: 'waiting', component: Waiting },
  { path: 'listening', component: Listening }, { path: 'voting', component: Voting },
  { path: 'round-result', component: RoundResult }, { path: 'scoreboard', component: Scoreboard },
  { path: 'game-result', component: GameResult }, { path: 'summary', component: GameSummary },
] as const;

export const routes: Routes = [
  { path: '', component: Home }, { path: 'join', component: JoinRoom },
  ...phases.map(({ path, component }) => ({ path: `room/:roomCode${path ? `/${path}` : ''}`, component })),
  { path: 'mock', redirectTo: 'mock/host', pathMatch: 'full' },
  ...phases.map(({ path, component }) => ({ path: `mock/:role${path ? `/${path}` : ''}`, component })),
  { path: 'v2', redirectTo: '', pathMatch: 'full' }, { path: 'v2/join', redirectTo: 'join', pathMatch: 'full' },
  ...phases.map(({ path }) => ({ path: `v2/room/:roomCode${path ? `/${path}` : ''}`, redirectTo: `room/:roomCode${path ? `/${path}` : ''}`, pathMatch: 'full' as const })),
  ...phases.map(({ path }) => ({ path: `v2/mock/:role${path ? `/${path}` : ''}`, redirectTo: `mock/:role${path ? `/${path}` : ''}`, pathMatch: 'full' as const })),
  { path: '**', redirectTo: '' },
];
