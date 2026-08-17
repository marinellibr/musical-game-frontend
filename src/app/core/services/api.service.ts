import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateRoomResponse,
  JoinRoomResponse,
  RoomState,
  GameCategory,
  GameTheme,
  GameVersion,
  SpotifyTrack,
  YouTubeMetadata,
} from '../models/room.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  createRoom(username: string, isPlaying: boolean, gameVersion: GameVersion): Observable<CreateRoomResponse> {
    if (environment.mockRole) return this.mockData().pipe(map((data) => ({ roomCode: data.roomCode, player: { ...data.host, username, isPlaying }, playerToken: 'local-mock-token', gameVersion })));
    return this.http.post<CreateRoomResponse>(`${this.baseUrl}/rooms`, {
      username,
      isPlaying,
      gameVersion,
    });
  }

  joinRoom(roomCode: string, username: string): Observable<JoinRoomResponse> {
    if (environment.mockRole) return this.mockData().pipe(map((data) => ({ roomCode: data.roomCode, player: { ...data.players[0], username }, playerToken: 'local-mock-token', gameVersion: 'v2' as const })));
    return this.http.post<JoinRoomResponse>(
      `${this.baseUrl}/rooms/${encodeURIComponent(roomCode)}/join`,
      { username },
    );
  }

  getRoom(roomCode: string): Observable<RoomState> {
    if (environment.mockRole) return this.mockData().pipe(map((data) => ({ roomCode: data.roomCode, status: 'LOBBY', gameVersion: 'v2' as const, host: data.host, players: data.players, settings: data.settings, game: null })));
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

  getGameCategories(): Observable<{ items: GameCategory[] }> {
    if (environment.mockRole) return this.mockData().pipe(map((data) => ({ items: this.groupMockCategories(data.themes || []) })));
    return this.http.get<{ items: GameCategory[] }>(`${this.baseUrl}/game-categories`);
  }

  validateYouTube(url: string): Observable<YouTubeMetadata> {
    if (environment.mockRole) return this.mockData().pipe(map((data) => data.youtube));
    return this.http.get<YouTubeMetadata>(`${this.baseUrl}/youtube/metadata`, { params: { url } });
  }

  private mockData(): Observable<{ roomCode: string; settings: RoomState['settings']; host: RoomState['host']; players: RoomState['players']; spotifyTracks: SpotifyTrack[]; youtube: YouTubeMetadata; themes?: GameTheme[] }> {
    return this.http.get<{ roomCode: string; settings: RoomState['settings']; host: RoomState['host']; players: RoomState['players']; spotifyTracks: SpotifyTrack[]; youtube: YouTubeMetadata; themes?: GameTheme[] }>('/mock.json');
  }

  private groupMockCategories(themes: GameTheme[]): GameCategory[] {
    const grouped = new Map<string, GameCategory>();
    for (const theme of themes) {
      const rawCategoryId = theme.category?.trim();
      if (!rawCategoryId) continue;
      const categoryId = rawCategoryId === 'HOT_TAKES' ? 'HOT_TAKE' : rawCategoryId;
      const presentation = this.categoryPresentation(categoryId);
      const category = grouped.get(categoryId) || {
        id: categoryId,
        ...presentation,
        examples: [],
      };
      if (category.examples.length < 1) category.examples.push({ id: theme.id, title: theme.title });
      grouped.set(categoryId, category);
    }
    return [...grouped.values()].sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'));
  }

  private categoryPresentation(category: string): Pick<GameCategory, 'label' | 'description'> {
    const metadata: Record<string, Pick<GameCategory, 'label' | 'description'>> = {
      INSTRUMENTS: { label: 'Instrumentos', description: 'Instrumentos, performances e momentos musicais.' },
      VOCALS: { label: 'Vocais', description: 'Vozes, interpretações e performances vocais.' },
      EMOTIONS: { label: 'Emoções', description: 'Músicas ligadas a sentimentos e memórias.' },
      SITUATIONS: { label: 'Situações', description: 'Músicas perfeitas para diferentes momentos.' },
      CHAOS: { label: 'Caos', description: 'Escolhas intensas, imprevisíveis e fora do comum.' },
      CINEMA: { label: 'Cinema', description: 'Momentos musicais ligados ao cinema.' },
      HOT_TAKE: { label: 'Hot Takes', description: 'Opiniões musicais que rendem discussão.' },
      NOSTALGIA: { label: 'Nostalgia', description: 'Músicas que transportam para outras épocas.' },
      LIVE: { label: 'Ao vivo', description: 'Performances e gravações que funcionam melhor ao vivo.' },
      ARTIST: { label: 'Artistas', description: 'Temas dedicados a artistas e suas discografias.' },
      ALBUM: { label: 'Álbuns', description: 'Faixas e momentos marcantes de álbuns.' },
      BRAZIL: { label: 'Brasil', description: 'Música brasileira em diferentes estilos e épocas.' },
      COVERS: { label: 'Covers', description: 'Releituras e novas versões de músicas conhecidas.' },
      LYRICS: { label: 'Letras', description: 'Letras, versos e histórias contadas por músicas.' },
      DISCOVERY: { label: 'Descobertas', description: 'Faixas e artistas que merecem ser descobertos.' },
      SOUNDTRACKS: { label: 'Trilhas sonoras', description: 'Músicas marcantes de filmes, séries e jogos.' },
      GENERATIONS: { label: 'Gerações', description: 'Músicas que definiram épocas e gerações.' },
      DANCE: { label: 'Dança', description: 'Faixas feitas para movimentar a pista.' },
      REMIXES: { label: 'Remixes', description: 'Remixes e versões que transformam a original.' },
      MUSIC_VIDEOS: { label: 'Videoclipes', description: 'Clipes e momentos visuais inesquecíveis.' },
    };
    const fallbackLabel = category.toLocaleLowerCase('pt-BR').split('_').map((word) => word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1)).join(' ');
    return metadata[category] || { label: fallbackLabel, description: 'Temas musicais desta categoria.' };
  }
}
