import { Component, effect, input, signal } from '@angular/core';
import QRCode from 'qrcode';

@Component({ selector: 'app-room-qr', template: `<div class="room-qr">@if (dataUrl()) { <img [src]="dataUrl()" alt="QR Code para entrar na sala" /> }<strong>{{ roomCode() }}</strong><span>Escaneie para entrar</span></div>` })
export class RoomQr {
  readonly roomCode = input.required<string>();
  readonly dataUrl = signal('');
  constructor() { effect(() => { const code = this.roomCode(); const url = `https://marinellibr.github.io/musical-game-frontend/room/${encodeURIComponent(code)}`; void QRCode.toDataURL(url, { width: 360, margin: 1, color: { dark: '#000000', light: '#ffffff' } }).then((value) => this.dataUrl.set(value)); }); }
}
