export interface PublicPlayer {
  playerId: string;
  username: string;
  isHost: boolean;
  isPlaying: boolean;
  connected: boolean;
  participationStatus: ParticipationStatus;
}
export type ParticipationStatus = 'ACTIVE' | 'WAITING_NEXT_ROUND';

export interface RoomState {
  roomCode: string;
  status: string;
  host: PublicPlayer;
  players: PublicPlayer[];
  game: PublicGameState | null;
}

export type ThemeReaction = 'like' | 'dislike';
export type GamePhase = 'THEME_SELECTION' | 'CHOOSING' | 'LISTENING' | 'VOTING' | 'ROUND_RESULTS';
export type MediaSource = 'SPOTIFY' | 'YOUTUBE';

export interface GameTheme {
  id: string;
  title: string;
  type: string;
  category?: string;
  example?: string;
  sourceReference?: { provider: string; resourceType: string; id: string };
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
  roundStartedAt: number | null;
  roundEndsAt: number | null;
  submittedCount: number;
  waitingNextRoundCount: number;
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardEntry { playerId: string; username: string; totalLikes: number; totalDislikes: number; voteBalance: number; position: number; }

export interface ThemeReactionState {
  themeId?: string;
  reaction: ThemeReaction | null;
}

export interface SubmissionInput {
  source: MediaSource;
  title: string;
  artist?: string;
  spotifyTrackId?: string;
  youtubeVideoId?: string;
  startTime?: number;
  thumbnail?: string;
}

export interface PublicMedia extends SubmissionInput {
  startTime: number;
  externalUrl: string;
}

export interface PublicListeningState {
  theme: GameTheme;
  index: number;
  total: number;
  current: PublicMedia | null;
  finished: boolean;
  votingEnabled: boolean;
}

export interface VotingGroup {
  groupId: string;
  media: PublicMedia;
  canVote: boolean;
}

export interface VotingView {
  ownSubmission: PublicMedia | null;
  groups: VotingGroup[];
  hasVoted: boolean;
  canVote: boolean;
  votedPlayers: string[];
  eligiblePlayersCount: number;
  votingStartedAt: number;
  votingEndsAt: number;
}

export interface GroupVote {
  likedGroupId: string;
  dislikedGroupId: string;
}

export type ResultRevealStage = 'AUTHORS' | 'VOTES' | 'RANKING';
export interface RoundRankingEntry {
  groupId: string;
  media: PublicMedia;
  authors: Array<{ playerId: string; username: string }>;
  likes: number;
  dislikes: number;
  voteBalance: number;
  position: number;
}
export interface RoundResultView {
  round: number;
  totalRounds: number;
  theme: GameTheme;
  revealStage: ResultRevealStage;
  ranking: RoundRankingEntry[];
  leaderboard: LeaderboardEntry[];
  isLastRound: boolean;
}

export interface SpotifyTrack {
  trackId: string;
  trackUri?: string;
  title: string;
  artist?: string;
  album?: string;
  albumId?: string;
  image?: string;
}

export interface YouTubeMetadata {
  videoId: string;
  startTime: number;
  title: string;
  channel?: string;
  thumbnail?: string | null;
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
