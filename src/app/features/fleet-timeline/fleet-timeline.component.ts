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

  // تغییر به نوع اتحادی برای پذیرش حالت تکی و کلی
  readonly selectedAirplaneId = signal<string | 'ALL'>('ALL');
  readonly schedules = signal<FleetScheduleDto[]>([]);
  readonly loading = signal(false);

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
    // اگر شیء کامل بود از register استفاده می‌کند، در غیر این صورت شناسه را برمی‌گرداند
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
      // حالت پیش‌فرض را روی ALL تنظیم می‌کنیم، در صورت تمایل می‌توانید روی اولین هواپیما بگذارید.
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

  // فیلتر هوشمند برنامه‌ها بر اساس حالت تکی یا کلی
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

  getSegmentsForDay(dayIndex: number): ScheduleSegment[] {
    return this.scheduleSegments().filter(segment => segment.dayIndex === dayIndex);
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

  // =========================
  // POSITIONING & OVERLAP ENGINE
  // =========================
  getSegmentStyle(segment: ScheduleSegment, dayIdx: number): { [key: string]: string } {
    const leftPercent = (segment.startMinutes / 1440) * 100;
    const widthPercent = ((segment.endMinutes - segment.startMinutes) / 1440) * 100;

    const daySegments = this.getSegmentsForDay(dayIdx);
    const daySchedules = daySegments.map(s => s.schedule);

    // الگوریتم لاین‌بندی داینامیک پیشرفته بر اساس تداخل زمان‌ها و تفکیک بر اساس هواپیما
    const lanes = this.getLanesForDay(daySchedules);
    const laneIdx = this.getLaneIndex(segment.schedule, lanes);

    // محاسبه‌ی تاپ پویا: کارت‌ها ارتفاع فشرده‌تری می‌گیرند تا در ردیف ۱۱۰ پیکسلی جا شوند
    const cardHeight = 42;
    const gap = 6;
    const topPosition = 12 + (laneIdx * (cardHeight + gap));

    return {
      position: 'absolute',
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      top: `${topPosition}px`,
      height: `${cardHeight}px`
    };
  }

  getLanesForDay(schedules: FleetScheduleDto[]): FleetScheduleDto[][] {
    const sorted = [...schedules].sort((a, b) =>
      new Date(a.plannedStartTime).getTime() - new Date(b.plannedStartTime).getTime()
    );

    const lanes: FleetScheduleDto[][] = [];
    const isAllMode = this.selectedAirplaneId() === 'ALL';

    for (const schedule of sorted) {
      const start = new Date(schedule.plannedStartTime).getTime();
      const end = new Date(schedule.plannedEndTime).getTime();
      let placed = false;

      for (const lane of lanes) {
        // قانون اول: در حالت ALL، پروازهای دو هواپیمای مختلف به هیچ وجه در یک لاین افقی قرار نگیرند
        if (isAllMode && lane.length > 0 && lane[0].airplane?.id !== schedule.airplane?.id) {
          continue;
        }

        // قانون دوم: بررسی عدم تداخل زمانی
        const overlap = lane.some(existing => {
          const exStart = new Date(existing.plannedStartTime).getTime();
          const exEnd = new Date(existing.plannedEndTime).getTime();
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

    const start = TimeUtils.parseUTC(schedule.plannedStartTime);
    const actual = TimeUtils.parseUTC(schedule.event.actualStartTime);

    const diff =
      (actual.getTime() - start.getTime()) / 60000;

    const plannedDuration =
      (TimeUtils.parseUTC(schedule.plannedEndTime).getTime() - start.getTime()) /
      60000;

    return `${(diff / plannedDuration) * 100}%`;
  }

  getActualWidth(schedule: FleetScheduleDto): string {
    if (
      !schedule.event?.actualStartTime ||
      !schedule.event?.actualEndTime
    ) {
      return '0%';
    }

    const actualStart = TimeUtils.parseUTC(schedule.event.actualStartTime);
    const actualEnd = TimeUtils.parseUTC(schedule.event.actualEndTime);

    const plannedStart = TimeUtils.parseUTC(schedule.plannedStartTime);
    const plannedEnd = TimeUtils.parseUTC(schedule.plannedEndTime);

    const actualMinutes =
      (actualEnd.getTime() - actualStart.getTime()) / 60000;

    const plannedMinutes =
      (plannedEnd.getTime() - plannedStart.getTime()) / 60000;

    return `${(actualMinutes / plannedMinutes) * 100}%`;
  }
}
