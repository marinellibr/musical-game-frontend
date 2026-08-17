export interface PublicPlayer {
  playerId: string;
  username: string;
  isHost: boolean;
  isPlaying: boolean;
  connected: boolean;
}

export interface RoomState {
  roomCode: string;
  status: string;
  host: PublicPlayer;
  players: PublicPlayer[];
  game: PublicGameState | null;
}

export type ThemeReaction = 'like' | 'dislike';
export type GamePhase = 'THEME_SELECTION' | 'PLAYING';

export interface GameTheme {
  id: string;
  title: string;
  type: string;
  category?: string;
}

export interface PublicGameState {
  round: number;
  totalRounds: number;
  phase: GamePhase;
  currentTheme: GameTheme;
  likes: number;
  dislikes: number;
  reactedPlayers: number;
  playersCount: number;
}

export interface ThemeReactionState {
  themeId?: string;
  reaction: ThemeReaction | null;
}

export interface PlayerSession {
  roomCode: string;
  playerId: string;
  playerToken: string;
  username: string;
  isHost: boolean;
  isPlaying: boolean;
}

export interface RoomEntryResponse {
  roomCode: string;
  player: PublicPlayer;
  playerToken: string;
}

export type CreateRoomResponse = RoomEntryResponse;
export type JoinRoomResponse = RoomEntryResponse;

export interface ApiErrorBody {
  error?: { code?: string; message?: string };
}
