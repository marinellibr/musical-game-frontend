import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateRoomResponse,
  JoinRoomResponse,
  RoomState,
  SpotifyTrack,
  YouTubeMetadata,
} from '../models/room.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  createRoom(username: string, isPlaying: boolean): Observable<CreateRoomResponse> {
    return this.http.post<CreateRoomResponse>(`${this.baseUrl}/rooms`, {
      username,
      isPlaying,
    });
  }

  joinRoom(roomCode: string, username: string): Observable<JoinRoomResponse> {
    return this.http.post<JoinRoomResponse>(
      `${this.baseUrl}/rooms/${encodeURIComponent(roomCode)}/join`,
      { username },
    );
  }

  getRoom(roomCode: string): Observable<RoomState> {
    return this.http.get<RoomState>(
      `${this.baseUrl}/rooms/${encodeURIComponent(roomCode)}`,
    );
  }

  searchSpotify(query: string): Observable<{ query: string; items: SpotifyTrack[] }> {
    return this.http.get<{ query: string; items: SpotifyTrack[] }>(`${this.baseUrl}/spotify/search`, { params: { q: query } });
  }

  getAlbumTracks(albumId: string): Observable<{ albumId: string; items: SpotifyTrack[] }> {
    return this.http.get<{ albumId: string; items: SpotifyTrack[] }>(`${this.baseUrl}/spotify/albums/${encodeURIComponent(albumId)}/tracks`);
  }

  validateYouTube(url: string): Observable<YouTubeMetadata> {
    return this.http.get<YouTubeMetadata>(`${this.baseUrl}/youtube/metadata`, { params: { url } });
  }
}
