import { Component, effect, input, signal } from '@angular/core';
import QRCode from 'qrcode';
import { Skeleton } from '../skeleton/skeleton';

@Component({ selector: 'app-room-qr', imports: [Skeleton], template: `<div class="room-qr"><div class="qr-frame">@if (dataUrl()) { <img [src]="dataUrl()" alt="QR Code para entrar na sala" /> } @else if (error()) { <span class="qr-error">QR indisponível</span> } @else { <app-skeleton variant="qr" label="Gerando QR Code" /> }</div><strong>{{ roomCode() }}</strong><span>{{ error() || 'Escaneie para entrar' }}</span></div>` })
export class RoomQr {
  readonly roomCode = input.required<string>();
  readonly dataUrl = signal('');
  readonly error = signal('');
  constructor() { effect(() => { const code = this.roomCode(); const url = `https://marinellibr.github.io/musical-game-frontend/room/${encodeURIComponent(code)}`; this.dataUrl.set(''); this.error.set(''); void QRCode.toDataURL(url, { width: 360, margin: 1, color: { dark: '#000000', light: '#ffffff' } }).then((value) => this.dataUrl.set(value)).catch(() => this.error.set('Use o código da sala')); }); }
}
