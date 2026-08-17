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
