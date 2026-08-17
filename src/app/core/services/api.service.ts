import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
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
    if (environment.mockRole) return this.mockData().pipe(map((data) => ({ roomCode: data.roomCode, player: { ...data.host, username, isPlaying }, playerToken: 'local-mock-token' })));
    return this.http.post<CreateRoomResponse>(`${this.baseUrl}/rooms`, {
      username,
      isPlaying,
    });
  }

  joinRoom(roomCode: string, username: string): Observable<JoinRoomResponse> {
    if (environment.mockRole) return this.mockData().pipe(map((data) => ({ roomCode: data.roomCode, player: { ...data.players[0], username }, playerToken: 'local-mock-token' })));
    return this.http.post<JoinRoomResponse>(
      `${this.baseUrl}/rooms/${encodeURIComponent(roomCode)}/join`,
      { username },
    );
  }

  getRoom(roomCode: string): Observable<RoomState> {
    if (environment.mockRole) return this.mockData().pipe(map((data) => ({ roomCode: data.roomCode, status: 'LOBBY', host: data.host, players: data.players, settings: data.settings, game: null })));
    return this.http.get<RoomState>(
      `${this.baseUrl}/rooms/${encodeURIComponent(roomCode)}`,
    );
  }

  searchSpotify(query: string): Observable<{ query: string; items: SpotifyTrack[] }> {
    if (environment.mockRole) return this.mockData().pipe(map((data) => ({ query, items: data.spotifyTracks })));
    return this.http.get<{ query: string; items: SpotifyTrack[] }>(`${this.baseUrl}/spotify/search`, { params: { q: query } });
  }

  getAlbumTracks(albumId: string): Observable<{ albumId: string; items: SpotifyTrack[] }> {
    if (environment.mockRole) return this.mockData().pipe(map((data) => ({ albumId, items: data.spotifyTracks })));
    return this.http.get<{ albumId: string; items: SpotifyTrack[] }>(`${this.baseUrl}/spotify/albums/${encodeURIComponent(albumId)}/tracks`);
  }

  validateYouTube(url: string): Observable<YouTubeMetadata> {
    if (environment.mockRole) return this.mockData().pipe(map((data) => data.youtube));
    return this.http.get<YouTubeMetadata>(`${this.baseUrl}/youtube/metadata`, { params: { url } });
  }

  private mockData(): Observable<{ roomCode: string; settings: RoomState['settings']; host: RoomState['host']; players: RoomState['players']; spotifyTracks: SpotifyTrack[]; youtube: YouTubeMetadata }> {
    return this.http.get<{ roomCode: string; settings: RoomState['settings']; host: RoomState['host']; players: RoomState['players']; spotifyTracks: SpotifyTrack[]; youtube: YouTubeMetadata }>('/mock.json');
  }
}
