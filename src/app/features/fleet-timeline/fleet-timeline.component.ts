import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FleetScheduleApiService } from '../../core/services/api/fleet-schedule-api.service';
import { AirplaneApiService } from '../../core/services/api/airplane-api.service';
import { AirplaneDto } from '../../core/models/airplane.model';
import { FleetScheduleDto, ScheduleSegment } from '../../core/models/fleet-schedule.model';
import { TranslatePipe } from '@ngx-translate/core';
import { TimeUtils } from '../../core/TimeUtils';

export type TimelineViewMode = '1_WEEK' | '2_WEEKS' | '1_MONTH';

@Component({
  selector: 'app-fleet-timeline',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './fleet-timeline.component.html',
  styleUrl: './fleet-timeline.component.css'
})
export class FleetTimelineComponent implements OnInit, OnDestroy {

  private scheduleApi = inject(FleetScheduleApiService);
  private airplaneApi = inject(AirplaneApiService);

  // =========================
  // STATE
  // =========================
  readonly viewMode = signal<TimelineViewMode>('1_WEEK');
  readonly airplanes = signal<AirplaneDto[]>([]);
  readonly selectedAirplaneId = signal<string | 'ALL'>('ALL');
  readonly schedules = signal<FleetScheduleDto[]>([]);
  readonly loading = signal(false);
  readonly showActualTimes = signal(true); // کنترل نمایش زمان‌های واقعی

  private currentTime = signal<Date>(new Date());
  private clockInterval: any;

  readonly WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {
    this.loadAirplanes();
    this.loadSchedules();
    this.startLiveClock();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  getAirplaneRegister(airplane: any): string {
    if (!airplane) return 'A/C';
    return airplane.register || airplane.id || 'A/C';
  }

  private startLiveClock(): void {
    this.clockInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 10000);
  }

  loadAirplanes(): void {
    this.airplaneApi.load().subscribe(planes => {
      this.airplanes.set(planes);
      if (!this.selectedAirplaneId()) {
        this.selectedAirplaneId.set('ALL');
      }
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
  // COMPUTED FILTERS
  // =========================

  readonly currentAirplaneSchedules = computed(() => {
    const planeId = this.selectedAirplaneId();
    if (planeId === 'ALL') {
      return this.schedules();
    }
    return this.schedules().filter(s =>
      s.airplane?.id === planeId || s.airplane?.id?.toString() === planeId
    );
  });

  readonly scheduleSegments = computed(() => {
    return this.currentAirplaneSchedules()
      .flatMap(schedule => this.createSegments(schedule));
  });

  // ** جدید: سگمنت‌های با زمان واقعی **
  readonly actualScheduleSegments = computed(() => {
    return this.currentAirplaneSchedules()
      .filter(s => s.event?.actualStartTime && s.event?.actualEndTime)
      .flatMap(schedule => this.createActualSegments(schedule));
  });

  readonly currentAirplaneDetails = computed(() => {
    const planeId = this.selectedAirplaneId();
    if (planeId === 'ALL') return null;
    return this.airplanes().find(p => p.id === planeId) ?? null;
  });

  private createSegments(schedule: FleetScheduleDto): ScheduleSegment[] {
    const segments: ScheduleSegment[] = [];
    const start = TimeUtils.parseUTC(schedule.plannedStartTime);
    const end = TimeUtils.parseUTC(schedule.plannedEndTime);

    const startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

    for (let day = new Date(startDay); day <= endDay; day.setUTCDate(day.getUTCDate() + 1)) {
      const isFirst = TimeUtils.getUTCDateKey(day) === TimeUtils.getUTCDateKey(start);
      const isLast = TimeUtils.getUTCDateKey(day) === TimeUtils.getUTCDateKey(end);

      const startMinutes = isFirst ? TimeUtils.toUTCMinutes(start) : 0;
      const endMinutes = isLast ? TimeUtils.toUTCMinutes(end) : 1440;
      const dayIndex = TimeUtils.getISOWeekDay(day);

      segments.push({
        schedule,
        dayIndex,
        startMinutes,
        endMinutes,
        isFirstSegment: isFirst,
        isLastSegment: isLast
      });
    }
    return segments;
  }

  // ** جدید: ایجاد سگمنت‌های زمان واقعی **
  private createActualSegments(schedule: FleetScheduleDto): ScheduleSegment[] {
    if (!schedule.event?.actualStartTime || !schedule.event?.actualEndTime) {
      return [];
    }

    const segments: ScheduleSegment[] = [];
    const start = TimeUtils.parseUTC(schedule.event.actualStartTime);
    const end = TimeUtils.parseUTC(schedule.event.actualEndTime);

    const startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

    for (let day = new Date(startDay); day <= endDay; day.setUTCDate(day.getUTCDate() + 1)) {
      const isFirst = TimeUtils.getUTCDateKey(day) === TimeUtils.getUTCDateKey(start);
      const isLast = TimeUtils.getUTCDateKey(day) === TimeUtils.getUTCDateKey(end);

      const startMinutes = isFirst ? TimeUtils.toUTCMinutes(start) : 0;
      const endMinutes = isLast ? TimeUtils.toUTCMinutes(end) : 1440;
      const dayIndex = TimeUtils.getISOWeekDay(day);

      segments.push({
        schedule,
        dayIndex,
        startMinutes,
        endMinutes,
        isFirstSegment: isFirst,
        isLastSegment: isLast,
        isActual: true // نشانه‌گذاری به عنوان زمان واقعی
      });
    }
    return segments;
  }

  getSegmentsForDay(dayIndex: number): ScheduleSegment[] {
    return this.scheduleSegments().filter(segment => segment.dayIndex === dayIndex);
  }

  // ** جدید: دریافت سگمنت‌های زمان واقعی برای روز **
  getActualSegmentsForDay(dayIndex: number): ScheduleSegment[] {
    return this.actualScheduleSegments().filter(segment => segment.dayIndex === dayIndex);
  }

  getSchedule(segment: ScheduleSegment): FleetScheduleDto {
    return segment.schedule;
  }

  // =========================
  // TIME HELPERS
  // =========================
  readonly currentTimePosition = computed(() => {
    const now = new Date();
    const totalMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const positionPercent = (totalMinutes / 1440) * 100;
    return `${Math.min(Math.max(positionPercent, 0), 100)}%`;
  });

  readonly showCurrentTimeLine = computed(() => true);

  getBlockSizeBySegment(segment: ScheduleSegment): 'xs' | 'sm' | 'md' | 'lg' {
    const duration = segment.endMinutes - segment.startMinutes;
    if (duration <= 45) return 'xs';
    if (duration <= 90) return 'sm';
    if (duration <= 240) return 'md';
    return 'lg';
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'FLIGHT': return '✈';
      case 'CHECK': return '🔧';
      case 'DFDR': return '📦';
      default: return '•';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'FLIGHT': return 'Flight';
      case 'CHECK': return 'Maintenance Check';
      case 'DFDR': return 'DFDR Readout';
      default: return type;
    }
  }

  getAirportCode(airport: any): string {
    if (!airport) return '---';
    return airport.code || airport.id?.substring(0, 4) || 'N/A';
  }

  formatTime(isoString: string | undefined): string {
    if (!isoString) return '';
    return TimeUtils.formatUTC(isoString);
  }

  switchView(mode: TimelineViewMode): void {
    this.viewMode.set(mode);
  }

  selectAirplane(id: string): void {
    this.selectedAirplaneId.set(id);
  }

  toggleActualTimes(): void {
    this.showActualTimes.update(v => !v);
  }

  // =========================
  // POSITIONING & OVERLAP ENGINE
  // =========================

  // ** به روز شده: پشتیبانی از لاین‌های جداگانه برای زمان واقعی **
  getSegmentStyle(segment: ScheduleSegment, dayIdx: number, isActual: boolean = false): { [key: string]: string } {
    const leftPercent = (segment.startMinutes / 1440) * 100;
    const widthPercent = ((segment.endMinutes - segment.startMinutes) / 1440) * 100;

    const daySegments = isActual ?
      this.getActualSegmentsForDay(dayIdx) :
      this.getSegmentsForDay(dayIdx);

    const daySchedules = daySegments.map(s => s.schedule);

    const lanes = this.getLanesForDay(daySchedules, isActual);
    const laneIdx = this.getLaneIndex(segment.schedule, lanes);

    // ارتفاع کارت اصلی رو افزایش می‌دیم تا Actual خط زیرش جا بگیره
    const cardHeight = 75; // افزایش ارتفاع کارت
    const gap = 6;
    const topPosition = 14 + (laneIdx * (cardHeight + gap));

    return {
      position: 'absolute',
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      top: `${topPosition}px`,
      height: `${cardHeight}px`,
      'z-index': '10'
    };
  }

  // ** به روز شده: الگوریتم لاین‌بندی با در نظر گرفتن زمان واقعی **
  getLanesForDay(schedules: FleetScheduleDto[], isActual: boolean = false): FleetScheduleDto[][] {
    const sorted = [...schedules].sort((a, b) => {
      const timeA = isActual && a.event?.actualStartTime ?
        new Date(a.event.actualStartTime).getTime() :
        new Date(a.plannedStartTime).getTime();
      const timeB = isActual && b.event?.actualStartTime ?
        new Date(b.event.actualStartTime).getTime() :
        new Date(b.plannedStartTime).getTime();
      return timeA - timeB;
    });

    const lanes: FleetScheduleDto[][] = [];
    const isAllMode = this.selectedAirplaneId() === 'ALL';

    for (const schedule of sorted) {
      const start = isActual && schedule.event?.actualStartTime ?
        new Date(schedule.event.actualStartTime).getTime() :
        new Date(schedule.plannedStartTime).getTime();
      const end = isActual && schedule.event?.actualEndTime ?
        new Date(schedule.event.actualEndTime).getTime() :
        new Date(schedule.plannedEndTime).getTime();

      let placed = false;

      for (const lane of lanes) {
        if (isAllMode && lane.length > 0 && lane[0].airplane?.id !== schedule.airplane?.id) {
          continue;
        }

        const overlap = lane.some(existing => {
          const exStart = isActual && existing.event?.actualStartTime ?
            new Date(existing.event.actualStartTime).getTime() :
            new Date(existing.plannedStartTime).getTime();
          const exEnd = isActual && existing.event?.actualEndTime ?
            new Date(existing.event.actualEndTime).getTime() :
            new Date(existing.plannedEndTime).getTime();
          return !(end <= exStart || start >= exEnd);
        });

        if (!overlap) {
          lane.push(schedule);
          placed = true;
          break;
        }
      }

      if (!placed) {
        lanes.push([schedule]);
      }
    }
    return lanes;
  }

  getLaneIndex(schedule: FleetScheduleDto, lanes: FleetScheduleDto[][]): number {
    for (let i = 0; i < lanes.length; i++) {
      if (lanes[i].includes(schedule)) return i;
    }
    return 0;
  }

  // =========================
  // ACTUAL TIME COMPARISON HELPERS
  // =========================

  /** محاسبه انحراف زمان واقعی از زمان برنامه‌ریزی شده (به دقیقه) */
  getTimeDeviation(schedule: FleetScheduleDto): number | null {
    if (!schedule.event?.actualStartTime) return null;

    const planned = TimeUtils.parseUTC(schedule.plannedStartTime);
    const actual = TimeUtils.parseUTC(schedule.event.actualStartTime);

    return (actual.getTime() - planned.getTime()) / 60000;
  }

  /** تعیین رنگ انحراف بر اساس شدت */
  getDeviationColor(deviation: number | null): string {
    if (deviation === null) return '#6b7280';
    if (deviation === 0) return '#22c55e';
    if (deviation > 0 && deviation <= 15) return '#eab308';
    if (deviation > 15) return '#ef4444';
    return '#3b82f6'; // زودهنگام
  }

  /** فرمت انحراف زمانی */
  formatDeviation(deviation: number | null): string {
    if (deviation === null) return '---';
    const sign = deviation > 0 ? '+' : '';
    const abs = Math.abs(deviation);
    const hours = Math.floor(abs / 60);
    const minutes = Math.round(abs % 60);
    if (hours > 0) {
      return `${sign}${hours}h ${minutes}m`;
    }
    return `${sign}${minutes}m`;
  }

  // =========================
  // MODAL STATE
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

  getActualLeft(schedule: FleetScheduleDto): string {
    if (!schedule.event?.actualStartTime) {
      return '0%';
    }

    const plannedStart = TimeUtils.parseUTC(schedule.plannedStartTime);
    const plannedEnd = TimeUtils.parseUTC(schedule.plannedEndTime);
    const actualStart = TimeUtils.parseUTC(schedule.event.actualStartTime);

    const plannedDuration = (plannedEnd.getTime() - plannedStart.getTime()) / 60000;
    const offset = (actualStart.getTime() - plannedStart.getTime()) / 60000;

    return `${(offset / plannedDuration) * 100}%`;
  }

  getActualWidth(schedule: FleetScheduleDto): string {
    if (!schedule.event?.actualStartTime || !schedule.event?.actualEndTime) {
      return '0%';
    }

    const plannedStart = TimeUtils.parseUTC(schedule.plannedStartTime);
    const plannedEnd = TimeUtils.parseUTC(schedule.plannedEndTime);
    const actualStart = TimeUtils.parseUTC(schedule.event.actualStartTime);
    const actualEnd = TimeUtils.parseUTC(schedule.event.actualEndTime);

    const plannedDuration = (plannedEnd.getTime() - plannedStart.getTime()) / 60000;
    const actualDuration = (actualEnd.getTime() - actualStart.getTime()) / 60000;

    return `${(actualDuration / plannedDuration) * 100}%`;
  }

  formatFullDate(isoString: string | undefined): string {
    if (!isoString) {
      return '-';
    }

    const date = TimeUtils.parseUTC(isoString);

    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    }).format(date);
  }

  protected readonly Math = Math;
}
