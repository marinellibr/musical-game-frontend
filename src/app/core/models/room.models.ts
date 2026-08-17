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
