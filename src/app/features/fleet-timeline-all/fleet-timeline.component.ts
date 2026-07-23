import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FleetScheduleApiService } from '../../core/services/api/fleet-schedule-api.service';
import { AirplaneApiService } from '../../core/services/api/airplane-api.service';
import { AirplaneDto } from '../../core/models/airplane.model';
import { FleetScheduleDto } from '../../core/models/fleet-schedule.model';
import { TranslatePipe } from '@ngx-translate/core';
import { TimeUtils } from '../../core/TimeUtils';

export interface DateTab {
  date: Date;
  dateStr: string; // فرمت DD/MM
  dayName: string;
}

export interface SegmentStyle {
  left: string;
  width: string;
  display?: string;
}

@Component({
  selector: 'app-fleet-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fleet-timeline.component.html',
  styleUrl: './fleet-timeline.component.css'
})
export class FleetTimelineComponent implements OnInit, OnDestroy {

  private scheduleApi = inject(FleetScheduleApiService);
  private airplaneApi = inject(AirplaneApiService);

  // =========================
  // STATE
  // =========================
  readonly airplanes = signal<AirplaneDto[]>([]);
  readonly schedules = signal<FleetScheduleDto[]>([]);
  readonly loading = signal(false);
  readonly showActualTimes = signal(true);

  // تاریخ‌های قابل انتخاب در تب پایینی
  readonly selectedDate = signal<Date>(new Date());
  readonly dateTabs = signal<DateTab[]>([]);

  private currentTime = signal<Date>(new Date());
  private clockInterval: any;

  readonly HOURS = Array.from({ length: 24 }, (_, i) => i); // [0, 1, ..., 23]

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {
    this.generateDateTabs();
    this.loadAirplanes();
    this.loadSchedules();
    this.startLiveClock();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  private startLiveClock(): void {
    this.clockInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 10000);
  }

  private generateDateTabs(): void {
    const tabs: DateTab[] = [];
    const today = new Date();
    // ایجاد ۷ روز (از ۲ روز قبل تا ۴ روز بعد)
    for (let i = -2; i <= 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      tabs.push({
        date: d,
        dateStr: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    this.dateTabs.set(tabs);
    this.selectedDate.set(tabs[2].date); // روز جاری
  }

  selectDate(tab: DateTab): void {
    this.selectedDate.set(tab.date);
  }

  loadAirplanes(): void {
    this.airplaneApi.load().subscribe(planes => {
      this.airplanes.set(planes);
    });
  }

  loadSchedules(): void {
    this.loading.set(true);
    this.scheduleApi.load().subscribe({
      next: (data) => {
        this.schedules.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // =========================
  // COMPUTED FILTERS & GANTT ENGINE
  // =========================

  /** دریافت تمام پروازها/رویدادهای مربوط به یک هواپیمای خاص در روز انتخاب‌شده */
  getSchedulesForAirplane(airplaneId: string | undefined): FleetScheduleDto[] {
    if (!airplaneId) return [];
    const selected = this.selectedDate();
    const selKey = TimeUtils.getUTCDateKey(selected);

    return this.schedules().filter(s => {
      const planeMatches = s.airplane?.id === airplaneId || s.airplane?.id?.toString() === airplaneId;
      if (!planeMatches) return false;

      const pStart = TimeUtils.parseUTC(s.plannedStartTime);
      const pKey = TimeUtils.getUTCDateKey(pStart);
      return pKey === selKey;
    });
  }

  // محاسبه استایل برای باکس زمان برنامه‌ریزی‌شده (Planned)
  getPlannedStyle(schedule: FleetScheduleDto): SegmentStyle {
    const start = TimeUtils.parseUTC(schedule.plannedStartTime);
    const end = TimeUtils.parseUTC(schedule.plannedEndTime);

    const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
    const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes();

    const leftPercent = (startMinutes / 1440) * 100;
    const widthPercent = Math.max(((endMinutes - startMinutes) / 1440) * 100, 1.2);

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`
    };
  }

  // محاسبه استایل برای نوار زمان واقعی (Actual Bar/Line)
  getActualStyle(schedule: FleetScheduleDto): SegmentStyle {
    if (!schedule.event?.actualStartTime || !schedule.event?.actualEndTime) {
      return { left: '0%', width: '0%', display: 'none' };
    }

    const start = TimeUtils.parseUTC(schedule.event.actualStartTime);
    const end = TimeUtils.parseUTC(schedule.event.actualEndTime);

    const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
    const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes();

    const leftPercent = (startMinutes / 1440) * 100;
    const widthPercent = Math.max(((endMinutes - startMinutes) / 1440) * 100, 1);

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`
    };
  }

  // =========================
  // TYPE SAFE HELPERS
  // =========================
  getAirplaneRegister(airplane: AirplaneDto | { id: string } | undefined): string {
    if (!airplane) return '---';
    if ('register' in airplane && airplane.register) {
      return airplane.register;
    }
    return airplane.id || '---';
  }

  // =========================
  // TIME & DEVIATION HELPERS
  // =========================
  readonly currentTimePosition = computed(() => {
    const now = this.currentTime();
    const totalMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    return `${(totalMinutes / 1440) * 100}%`;
  });

  getTimeDeviation(schedule: FleetScheduleDto): number | null {
    if (!schedule.event?.actualStartTime) return null;
    const planned = TimeUtils.parseUTC(schedule.plannedStartTime);
    const actual = TimeUtils.parseUTC(schedule.event.actualStartTime);
    return (actual.getTime() - planned.getTime()) / 60000;
  }

  getAirportCode(airport: any): string {
    if (!airport) return '---';
    return airport.code || airport.id?.substring(0, 3) || 'N/A';
  }

  formatTime(isoString: string | undefined): string {
    if (!isoString) return '';
    return TimeUtils.formatUTC(isoString);
  }

  toggleActualTimes(): void {
    this.showActualTimes.update(v => !v);
  }

  // =========================
  // MODAL HANDLERS
  // =========================
  selectedSchedule = signal<FleetScheduleDto | null>(null);
  showModal = signal(false);

  openScheduleDetails(schedule: FleetScheduleDto): void {
    this.selectedSchedule.set(schedule);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedSchedule.set(null);
  }

  formatFullDate(isoString: string | undefined): string {
    if (!isoString) return '-';
    const date = TimeUtils.parseUTC(isoString);
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC'
    }).format(date);
  }
}
