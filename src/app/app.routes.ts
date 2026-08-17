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

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'join',
    component: JoinRoom,
  },
  { path: 'v2', component: Home },
  { path: 'v2/join', component: JoinRoom },
  { path: 'v2/room/:roomCode', component: Lobby },
  { path: 'v2/room/:roomCode/theme', component: ThemeReveal },
  { path: 'v2/room/:roomCode/submission', component: Submission },
  { path: 'v2/room/:roomCode/waiting', component: Waiting },
  { path: 'v2/room/:roomCode/listening', component: Listening },
  { path: 'v2/room/:roomCode/voting', component: Voting },
  { path: 'v2/room/:roomCode/round-result', component: RoundResult },
  { path: 'v2/room/:roomCode/scoreboard', component: Scoreboard },
  { path: 'v2/room/:roomCode/game-result', component: GameResult },
  { path: 'v2/room/:roomCode/summary', component: GameSummary },
  {
    path: 'room/:roomCode',
    component: Lobby,
  },
  {
    path: 'room/:roomCode/theme',
    component: ThemeReveal,
  },
  {
    path: 'room/:roomCode/submission',
    component: Submission,
  },
  {
    path: 'room/:roomCode/waiting',
    component: Waiting,
  },
  {
    path: 'room/:roomCode/listening',
    component: Listening,
  },
  {
    path: 'room/:roomCode/voting',
    component: Voting,
  },
  {
    path: 'room/:roomCode/round-result',
    component: RoundResult,
  },
  {
    path: 'room/:roomCode/scoreboard',
    component: Scoreboard,
  },
  {
    path: 'room/:roomCode/game-result',
    component: GameResult,
  },
  {
    path: 'room/:roomCode/summary',
    component: GameSummary,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
