import { Component, OnDestroy, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-system-clock',
  standalone: true,
  template: `
    <div class="clock-dashboard">
      <div class="clock-zone local-zone">
        <span class="zone-label">LOCAL</span>
        <span class="time-display">{{ localTime() }}<span class="seconds">:{{ localSeconds() }}</span></span>
        <span class="date-display">{{ localDate() }}</span>
      </div>
      <div class="clock-divider"></div>
      <div class="clock-zone utc-zone">
        <span class="zone-label">UTC</span>
        <span class="time-display">{{ utcTime() }}<span class="seconds">:{{ utcSeconds() }}</span></span>
        <span class="date-display">{{ utcDate() }}</span>
      </div>
    </div>
  `,
  styleUrl: './system-clock.component.css',
})
export class SystemClockComponent implements OnInit, OnDestroy {
  readonly localTime = signal('');
  readonly localSeconds = signal('');
  readonly localDate = signal('');
  readonly utcTime = signal('');
  readonly utcSeconds = signal('');
  readonly utcDate = signal('');

  private timerId: ReturnType<typeof setInterval> | undefined;

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
    this.localTime.set(`${this.pad(now.getHours())}:${this.pad(now.getMinutes())}`);
    this.localSeconds.set(this.pad(now.getSeconds()));
    this.localDate.set(now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    this.utcTime.set(`${this.pad(now.getUTCHours())}:${this.pad(now.getUTCMinutes())}`);
    this.utcSeconds.set(this.pad(now.getUTCSeconds()));
    this.utcDate.set(`${now.getUTCDate()} ${now.toLocaleString('en-US', { timeZone: 'UTC', month: 'short' })}`);
  }

  private pad(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }
}
