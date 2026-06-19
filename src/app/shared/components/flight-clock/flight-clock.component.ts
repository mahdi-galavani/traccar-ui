import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flight-clock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="clock-dashboard">
      <div class="clock-zone local-zone">
        <span class="zone-label">LOCAL (LT)</span>
        <span class="time-display">
          {{ localTime() }}<span class="seconds">:{{ localSeconds() }}</span>
        </span>
        <span class="date-display">{{ localDate() }}</span>
      </div>

      <div class="clock-divider"></div>

      <div class="clock-zone zulu-zone">
        <span class="zone-label">ZULU (UTC)</span>
        <span class="time-display">
          {{ utcTime() }}<span class="seconds">:{{ utcSeconds() }}</span>
        </span>
        <span class="date-display">{{ utcDate() }}</span>
      </div>
    </div>
  `,
  styleUrl: './flight-clock.component.css'
})
export class FlightClockComponent implements OnInit, OnDestroy {
  readonly localTime = signal<string>('');
  readonly localSeconds = signal<string>('');
  readonly localDate = signal<string>('');

  readonly utcTime = signal<string>('');
  readonly utcSeconds = signal<string>('');
  readonly utcDate = signal<string>('');

  private timerId: any;

  ngOnInit(): void {
    this.updateClocks();
    this.timerId = setInterval(() => this.updateClocks(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  private updateClocks(): void {
    const now = new Date();

    // ─── ساعت محلی مرورگر ───
    this.localTime.set(this.pad(now.getHours()) + ':' + this.pad(now.getMinutes()));
    this.localSeconds.set(this.pad(now.getSeconds()));
    this.localDate.set(now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

    // ─── ساعت جهانی UTC (Zulu) ───
    this.utcTime.set(this.pad(now.getUTCHours()) + ':' + this.pad(now.getUTCMinutes()));
    this.utcSeconds.set(this.pad(now.getUTCSeconds()));
    this.utcDate.set(now.getUTCDate() + ' ' + now.toLocaleString('en-US', { timeZone: 'UTC', month: 'short' }));
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
