import { Injectable } from '@angular/core';
import { SpotifyTrack, YouTubeMetadata } from '../models/room.models';

export interface SubmissionDraft { roomCode: string; roundId: string; themeId: string; youtubeUrl?: string; startTime?: number | null; spotifyTrack?: SpotifyTrack; youtubeMetadata?: YouTubeMetadata; }
const KEY = 'musical-game:submission-draft';
@Injectable({ providedIn: 'root' })
export class SubmissionDraftService {
  get(roomCode: string, roundId: string, themeId: string): SubmissionDraft | null { try { const value = JSON.parse(localStorage.getItem(KEY) || 'null') as SubmissionDraft | null; return value?.roomCode === roomCode && value.roundId === roundId && value.themeId === themeId ? value : null; } catch { return null; } }
  save(draft: SubmissionDraft): void { localStorage.setItem(KEY, JSON.stringify(draft)); }
  clear(): void { localStorage.removeItem(KEY); }
}
