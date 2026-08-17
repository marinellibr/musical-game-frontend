import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SpotifyTrack, YouTubeMetadata } from '../core/models/room.models';
import { ApiService } from '../core/services/api.service';
import { RoomService } from '../core/services/room.service';
import { SubmissionDraftService } from '../core/services/submission-draft.service';
import { Loader } from '../shared/loader/loader';
import { Leaderboard } from '../shared/leaderboard/leaderboard';
import { RoomQr } from '../shared/room-qr/room-qr';
import { ThemeCard } from '../shared/theme-card/theme-card';
import { Skeleton } from '../shared/skeleton/skeleton';
import { SpotifyTrackCard } from '../shared/spotify-track-card/spotify-track-card';
import { AppIcon } from '../shared/icon/icon';

@Component({ selector: 'app-submission', imports: [AppIcon, FormsModule, Leaderboard, Loader, RoomQr, Skeleton, SpotifyTrackCard, ThemeCard], templateUrl: './submission.html' })
export class Submission implements OnInit, OnDestroy {
  readonly rooms = inject(RoomService); private readonly api = inject(ApiService); private readonly drafts = inject(SubmissionDraftService); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router);
  readonly now = signal(Date.now()); readonly spotifyResults = signal<SpotifyTrack[]>([]); readonly selectedTrack = signal<SpotifyTrack | null>(null); readonly youtubeMetadata = signal<YouTubeMetadata | null>(null); readonly loading = signal<'spotify' | 'youtube' | 'submit' | ''>(''); readonly formError = signal('');
  readonly spotifySearched = signal(false);
  roomCode = ''; spotifyQuery = ''; youtubeUrl = ''; startTime: number | null = null; startTimeText = '0:00'; private searchTimer?: ReturnType<typeof setTimeout>; private clockTimer?: ReturnType<typeof setInterval>; private restoredThemeId = '';
  constructor() { effect(() => { const state = this.rooms.state(); const session = this.rooms.sessionFor(state?.roomCode || this.roomCode); const player = state && session ? [state.host, ...state.players].find((item) => item.playerId === session.playerId) : null; if (player?.participationStatus === 'WAITING_NEXT_ROUND') void this.router.navigate(['/room', state!.roomCode, 'waiting']); if (state?.status === 'LISTENING') void this.router.navigate(['/room', state.roomCode, 'listening']); const game = state?.game; if (game && game.currentTheme.id !== this.restoredThemeId) { this.restoredThemeId = game.currentTheme.id; this.restoreDraft(); if (game.currentTheme.type === 'ALBUM') void this.loadAlbum(); } if (this.rooms.hasSubmitted()) { this.loading.set(''); this.drafts.clear(); } }); }
  ngOnInit(): void { this.roomCode = (this.route.snapshot.paramMap.get('roomCode') || '').toUpperCase(); const session = this.rooms.sessionFor(this.roomCode); if (session) this.rooms.connect(session); else void this.router.navigate(['/room', this.roomCode]); this.clockTimer = setInterval(() => this.now.set(Date.now()), 1000); }
  ngOnDestroy(): void { if (this.searchTimer) clearTimeout(this.searchTimer); if (this.clockTimer) clearInterval(this.clockTimer); }
  remainingSeconds(): number { return Math.max(0, Math.ceil(((this.rooms.state()?.game?.roundEndsAt || 0) - this.now()) / 1000)); }
  formattedTime(): string { const seconds = this.remainingSeconds(); return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
  onSpotifyQuery(): void { if (this.searchTimer) clearTimeout(this.searchTimer); if (this.spotifyQuery.trim().length < 2) { this.spotifyResults.set([]); return; } this.searchTimer = setTimeout(() => void this.searchSpotify(), 400); }
  private async searchSpotify(): Promise<void> { this.loading.set('spotify'); this.spotifySearched.set(false); this.formError.set(''); try { this.spotifyResults.set((await firstValueFrom(this.api.searchSpotify(this.spotifyQuery.trim()))).items); } catch { this.formError.set('Não foi possível pesquisar no Spotify.'); } finally { this.spotifySearched.set(true); this.loading.set(''); } }
  private async loadAlbum(): Promise<void> { const id = this.rooms.state()?.game?.currentTheme.sourceReference?.id; if (!id) { this.formError.set('Álbum não configurado para este tema.'); return; } this.loading.set('spotify'); this.spotifySearched.set(false); try { this.spotifyResults.set((await firstValueFrom(this.api.getAlbumTracks(id))).items); } catch { this.formError.set('Não foi possível carregar as faixas do álbum.'); } finally { this.spotifySearched.set(true); this.loading.set(''); } }
  chooseTrack(track: SpotifyTrack): void { this.selectedTrack.set(track); this.saveDraft(); }
  changeChoice(): void { this.rooms.resetSubmissionState(); this.selectedTrack.set(null); this.youtubeMetadata.set(null); this.saveDraft(); }
  async validateYouTube(): Promise<void> { if (!this.youtubeUrl.trim()) return; this.loading.set('youtube'); this.formError.set(''); try { const metadata = await firstValueFrom(this.api.validateYouTube(this.youtubeUrl.trim())); this.youtubeMetadata.set(metadata); this.setStartTime(metadata.startTime); this.saveDraft(); } catch (error: any) { const code = error?.error?.error?.code; this.formError.set(code === 'INVALID_URL' ? 'Link do YouTube inválido.' : code === 'VIDEO_NOT_FOUND' ? 'Não encontramos esse vídeo.' : 'Não foi possível verificar o vídeo agora. Tente novamente.'); this.youtubeMetadata.set(null); } finally { this.loading.set(''); } }
  submit(): void { const theme = this.rooms.state()?.game?.currentTheme; if (!theme || this.remainingSeconds() <= 0) return; const track = this.selectedTrack(); const youtube = this.youtubeMetadata(); if (track) this.rooms.submitChoice({ source:'SPOTIFY', title:track.title, artist:track.artist, spotifyTrackId:track.trackId, thumbnail:track.image }); else if (youtube && (theme.type !== 'MOMENT' || this.startTime !== null)) this.rooms.submitChoice({ source:'YOUTUBE', title:youtube.title, artist:youtube.channel, youtubeVideoId:youtube.videoId, startTime:this.startTime ?? 0, thumbnail:youtube.thumbnail || undefined }); else return; this.loading.set('submit'); }
  saveDraft(): void { const theme = this.rooms.state()?.game?.currentTheme; if (!theme) return; this.drafts.save({ roomCode:this.roomCode, roundId:this.roundId(), themeId:theme.id, youtubeUrl:this.youtubeUrl || undefined, startTime:this.startTime, spotifyTrack:this.selectedTrack() || undefined, youtubeMetadata:this.youtubeMetadata() || undefined }); }
  private roundId(): string { const game = this.rooms.state()?.game; return `${game?.round || 0}:${game?.roundStartedAt || 0}`; }
  private restoreDraft(): void { const theme = this.rooms.state()?.game?.currentTheme; if (!theme) return; const draft = this.drafts.get(this.roomCode, this.roundId(), theme.id); if (!draft) { this.drafts.clear(); this.setStartTime(0); return; } this.youtubeUrl = draft.youtubeUrl || ''; this.setStartTime(draft.startTime ?? 0); this.selectedTrack.set(draft.spotifyTrack || null); this.youtubeMetadata.set(draft.youtubeMetadata || null); }
  submittedTrack(): SpotifyTrack | null { const media = this.rooms.submittedMedia(); return media?.source === 'SPOTIFY' && media.spotifyTrackId ? { trackId: media.spotifyTrackId, title: media.title, artist: media.artist, image: media.thumbnail } : null; }
  updateStartTime(value: string): void {
    this.startTimeText = value;
    const match = value.trim().match(/^(\d+):([0-5]\d)$/);
    if (!match) { this.startTime = null; this.formError.set('Informe o tempo no formato minutos:segundos, por exemplo 3:07.'); return; }
    this.startTime = Number(match[1]) * 60 + Number(match[2]);
    this.formError.set('');
    this.saveDraft();
  }
  private setStartTime(seconds: number): void {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    this.startTime = safeSeconds;
    this.startTimeText = `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`;
  }
}
