import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FleetScheduleApiService } from '../../core/services/api/fleet-schedule-api.service';
import { AirplaneApiService } from '../../core/services/api/airplane-api.service';
import { AppPersonApiService } from '../../core/services/api/app-person-api.service';
import { AirplaneDto } from '../../core/models/airplane.model';
import { FleetScheduleDto, FleetScheduleSearchDto, ScheduleSegment } from '../../core/models/fleet-schedule.model';
import { AppPersonDto } from '../../core/models/app-person.model';
import { TimeUtils } from '../../core/TimeUtils';
import { ModalInfo } from '../../shared/components/modal-info/modal-info.component';
export type ViewMode = '1_WEEK' | '2_WEEKS';

@Component({
  selector: 'app-fleet-timeline',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ModalInfo],
  templateUrl: './fleet-timeline.component.html',
  styleUrl: './fleet-timeline.component.css',
})
export class FleetTimelineComponent implements OnInit, OnDestroy {
  // SERVICES

  private scheduleApi = inject(FleetScheduleApiService);
  private airplaneApi = inject(AirplaneApiService);
  private pilotApi = inject(AppPersonApiService);

  // STATE

  readonly items = signal<AppPersonDto[]>([]);

  readonly airplanes = signal<AirplaneDto[]>([]);

  readonly viewMode = signal<ViewMode>('1_WEEK');
  readonly selectedAirplaneId = signal<string>('ALL');
  readonly schedules = signal<FleetScheduleDto[]>([]);
  readonly loading = signal(false);
  readonly showActualTimes = signal(true);


  readonly dateRange = computed(() => {
    const mode = this.viewMode();
    const start = new Date();
    start.setHours(0, 0, 0, 0); // ابتدای امروز

    const daysCount = mode === '1_WEEK' ? 7 : 14;
    const end = new Date(start);
    end.setDate(start.getDate() + daysCount - 1);
    end.setHours(23, 59, 59, 999);

    return { start, end, daysCount };
  });

  /** ساخت لیست روزهای بازه جاری به همراه تاریخ دقیق */
  readonly rangeDays = computed(() => {
    const { start, daysCount } = this.dateRange();
    const days: { date: Date; dateStr: string; dayName: string }[] = [];

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      days.push({
        date: d,
        dateStr: TimeUtils.getUTCDateKey(d), // فرمت YYYY-MM-DD
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }
    return days;
  });


  // LIVE CLOCK

  private currentTime = signal<Date>(new Date());
  private clockInterval: any;

  // WEEK DAYS

  readonly WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // MODAL STATE

  readonly selectedSchedule = signal<FleetScheduleDto | null>(null);
  readonly showModal = signal(false);

  // PILOT STATE

  readonly selectedPilot = signal<AppPersonDto | null>(null);
  readonly pilotLoading = signal(false);

  // INIT

  ngOnInit(): void {
    this.loadAirplanes();

    this.loadSchedules();

    this.startLiveClock();
  }

  // DESTROY

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  // AIRPLANE

  getAirplaneRegister(airplane: any): string {
    if (!airplane) {
      return 'A/C';
    }
    return airplane.register || airplane.id || 'A/C';
  }

  // LIVE CLOCK
  private startLiveClock(): void {
    this.clockInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 10000);
  }

  // LOAD AIRPLANES
  loadAirplanes(): void {
    this.airplaneApi.load().subscribe({
      next: (planes) => {
        this.airplanes.set(planes);
        if (!this.selectedAirplaneId()) {
          this.selectedAirplaneId.set('ALL');
        }
      },
      error: (error) => {
        console.error('Failed to load airplanes:', error);
      },
    });
  }

  // COMPUTED FILTERS

  readonly currentAirplaneSchedules = computed(() => {
    const planeId = this.selectedAirplaneId();

    if (planeId === 'ALL') {
      return this.schedules();
    }
    return this.schedules().filter(
      (schedule) =>
        schedule.airplane?.id === planeId || schedule.airplane?.id?.toString() === planeId,
    );
  });

  // PLANNED SEGMENTS

  readonly scheduleSegments = computed(() => {
    return this.currentAirplaneSchedules().flatMap((schedule) => this.createSegments(schedule));
  });

  // ACTUAL SEGMENTS

  readonly actualScheduleSegments = computed(() => {
    return this.currentAirplaneSchedules()

      .filter((s) => s.event?.actualStartTime && s.event?.actualEndTime)

      .flatMap((schedule) => this.createActualSegments(schedule));
  });

  // CURRENT AIRPLANE DETAILS

  readonly currentAirplaneDetails = computed(() => {
    const planeId = this.selectedAirplaneId();
    if (planeId === 'ALL') {
      return null;
    }

    return this.airplanes().find((p) => p.id === planeId) ?? null;
  });

  // CREATE PLANNED SEGMENTS

  private createSegments(schedule: FleetScheduleDto): ScheduleSegment[] {
    const segments: ScheduleSegment[] = [];
    const start = TimeUtils.parseUTC(schedule.plannedStartTime);
    const end = TimeUtils.parseUTC(schedule.plannedEndTime);
    const startDay = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
    );
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
      });
    }
    return segments;
  }

  // CREATE ACTUAL SEGMENTS

  private createActualSegments(schedule: FleetScheduleDto): ScheduleSegment[] {
    if (!schedule.event?.actualStartTime || !schedule.event?.actualEndTime) {
      return [];
    }
    const segments: ScheduleSegment[] = [];
    const start = TimeUtils.parseUTC(schedule.event.actualStartTime);
    const end = TimeUtils.parseUTC(schedule.event.actualEndTime);
    const startDay = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
    );
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
        isActual: true,
      });
    }

    return segments;
  }

  // SEGMENTS BY DAY

  getSegmentsForDay(dayIdx: number): any[] {
    const targetDay = this.rangeDays()[dayIdx];
    if (!targetDay) return [];

    const targetDateKey = targetDay.dateStr; // تاریخ دقیق روز به فرمت YYYY-MM-DD

    return this.schedules().filter((s) => {
      // ۱. فیلتر هواپیما
      if (this.selectedAirplaneId() !== 'ALL') {
        const matchPlane =
          s.airplane?.id === this.selectedAirplaneId() ||
          s.airplane?.id?.toString() === this.selectedAirplaneId();
        if (!matchPlane) return false;
      }

      // ۲. فیلتر دقیق بر اساس تاریخ شروع پرواز (نه فقط نام روز هفته)
      const pStart = TimeUtils.parseUTC(s.plannedStartTime);
      const flightDateKey = TimeUtils.getUTCDateKey(pStart);

      return flightDateKey === targetDateKey;
    });
  }

  getActualSegmentsForDay(dayIndex: number): ScheduleSegment[] {
    return this.actualScheduleSegments().filter((segment) => segment.dayIndex === dayIndex);
  }

  getSchedule(segment: ScheduleSegment): FleetScheduleDto {
    return segment.schedule;
  }

  // CURRENT TIME

  readonly currentTimePosition = computed(() => {
    const now = new Date();
    const totalMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const positionPercent = (totalMinutes / 1440) * 100;
    return `${Math.min(Math.max(positionPercent, 0), 100)}%`;
  });

  readonly showCurrentTimeLine = computed(() => true);

  // BLOCK SIZE

  getBlockSizeBySegment(segment: ScheduleSegment): 'xs' | 'sm' | 'md' | 'lg' {
    const duration = segment.endMinutes - segment.startMinutes;
    if (duration <= 45) {
      return 'xs';
    }
    if (duration <= 90) {
      return 'sm';
    }

    if (duration <= 240) {
      return 'md';
    }

    return 'lg';
  }

  // TYPE HELPERS

  getTypeIcon(type: string): string {
    switch (type) {
      case 'FLIGHT':
        return '✈';

      case 'CHECK':
        return '🔧';

      case 'DFDR':
        return '📦';

      default:
        return '•';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'FLIGHT':
        return 'Flight';

      case 'CHECK':
        return 'Maintenance Check';

      case 'DFDR':
        return 'DFDR Readout';

      default:
        return type;
    }
  }

  getAirportCode(airport: any): string {
    if (!airport) {
      return '---';
    }

    return airport.code || airport.id?.substring(0, 4) || 'N/A';
  }

  formatTime(isoString: string | undefined): string {
    if (!isoString) {
      return '';
    }

    return TimeUtils.formatUTC(isoString);
  }

  // VIEW CONTROLS

  switchView(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.loadSchedules(); // فراخوانی مجدد بکند با بازه دقیق جدید
  }

  loadSchedules(): void {
    this.loading.set(true);
    const { start, end } = this.dateRange();

    const searchDto: FleetScheduleSearchDto = {
      from: start.toISOString(),
      to: end.toISOString(),
      boundaryTimes: true,
    };

    if (this.selectedAirplaneId() !== 'ALL') {
      searchDto.airplane = { id: this.selectedAirplaneId() };
    }

    this.scheduleApi.searchByDto(searchDto).subscribe({
      next: (data) => {
        this.schedules.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectAirplane(id: string): void {
    this.selectedAirplaneId.set(id);
  }

  toggleActualTimes(): void {
    this.showActualTimes.update((value) => !value);
  }

  // SEGMENT POSITION

  getSegmentStyle(
    segment: ScheduleSegment,
    dayIdx: number,
    isActual: boolean = false,
  ): { [key: string]: string } {
    const leftPercent = (segment.startMinutes / 1440) * 100;

    const widthPercent = ((segment.endMinutes - segment.startMinutes) / 1440) * 100;

    const daySegments = isActual
      ? this.getActualSegmentsForDay(dayIdx)
      : this.getSegmentsForDay(dayIdx);

    const daySchedules = daySegments.map((segment) => segment.schedule);

    const lanes = this.getLanesForDay(daySchedules, isActual);

    const laneIdx = this.getLaneIndex(segment.schedule, lanes);

    // ارتفاع کارت اصلی رو افزایش می‌دیم تا Actual خط زیرش جا بگیره
    const cardHeight = 75; // افزایش ارتفاع کارت

    const gap = 6;

    const topPosition = 14 + laneIdx * (cardHeight + gap);

    return {
      position: 'absolute',

      left: `${leftPercent}%`,

      width: `${widthPercent}%`,

      top: `${topPosition}px`,

      height: `${cardHeight}px`,

      'z-index': '10',
    };
  }

  // LANES

  getLanesForDay(schedules: FleetScheduleDto[], isActual: boolean = false): FleetScheduleDto[][] {
    const sorted = [...schedules].sort((a, b) => {
      const timeA =
        isActual && a.event?.actualStartTime
          ? new Date(a.event.actualStartTime).getTime()
          : new Date(a.plannedStartTime).getTime();

      const timeB =
        isActual && b.event?.actualStartTime
          ? new Date(b.event.actualStartTime).getTime()
          : new Date(b.plannedStartTime).getTime();

      return timeA - timeB;
    });

    const lanes: FleetScheduleDto[][] = [];

    const isAllMode = this.selectedAirplaneId() === 'ALL';

    for (const schedule of sorted) {
      const start =
        isActual && schedule.event?.actualStartTime
          ? new Date(schedule.event.actualStartTime).getTime()
          : new Date(schedule.plannedStartTime).getTime();

      const end =
        isActual && schedule.event?.actualEndTime
          ? new Date(schedule.event.actualEndTime).getTime()
          : new Date(schedule.plannedEndTime).getTime();

      let placed = false;

      for (const lane of lanes) {
        if (isAllMode && lane.length > 0 && lane[0].airplane?.id !== schedule.airplane?.id) {
          continue;
        }

        const overlap = lane.some((existing) => {
          const exStart =
            isActual && existing.event?.actualStartTime
              ? new Date(existing.event.actualStartTime).getTime()
              : new Date(existing.plannedStartTime).getTime();

          const exEnd =
            isActual && existing.event?.actualEndTime
              ? new Date(existing.event.actualEndTime).getTime()
              : new Date(existing.plannedEndTime).getTime();

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

  // LANE INDEX

  getLaneIndex(schedule: FleetScheduleDto, lanes: FleetScheduleDto[][]): number {
    for (let i = 0; i < lanes.length; i++) {
      if (lanes[i].includes(schedule)) {
        return i;
      }
    }

    return 0;
  }

  // ACTUAL TIME COMPARISON HELPERS

  /** محاسبه انحراف زمان واقعی از زمان برنامه‌ریزی شده (به دقیقه) */

  getTimeDeviation(schedule: FleetScheduleDto): number | null {
    if (!schedule.event?.actualStartTime) {
      return null;
    }

    const planned = TimeUtils.parseUTC(schedule.plannedStartTime);

    const actual = TimeUtils.parseUTC(schedule.event.actualStartTime);

    return (actual.getTime() - planned.getTime()) / 60000;
  }

  //  تعیین رنگ انحراف بر اساس شدت
  getDeviationColor(deviation: number | null): string {
    if (deviation === null) {
      return '#6b7280';
    }

    if (deviation === 0) {
      return '#22c55e';
    }

    if (deviation > 0 && deviation <= 15) {
      return '#eab308';
    }

    if (deviation > 15) {
      return '#ef4444';
    }

    return '#3b82f6'; // زودهنگام
  }

  // FORMAT DEVIATION

  formatDeviation(deviation: number | null): string {
    if (deviation === null) {
      return '---';
    }

    const sign = deviation > 0 ? '+' : '';

    const abs = Math.abs(deviation);

    const hours = Math.floor(abs / 60);

    const minutes = Math.round(abs % 60);

    if (hours > 0) {
      return `${sign}${hours}h ${minutes}m`;
    }

    return `${sign}${minutes}m`;
  }

  // MODAL

  openScheduleDetails(schedule: FleetScheduleDto): void {
    this.selectedSchedule.set(schedule);

    // وقتی Schedule جدید باز می‌شود
    // Pilot قبلی پاک شود
    this.selectedPilot.set(null);

    this.pilotLoading.set(false);

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);

    this.selectedSchedule.set(null);

    this.selectedPilot.set(null);

    this.pilotLoading.set(false);
  }

  // PILOT GET

  loadPilotDetails(pilotId: string): void {
    if (!pilotId) {
      return;
    }

    this.pilotLoading.set(true);
    this.selectedPilot.set(null);

    this.pilotApi.loadById(pilotId).subscribe({
      next: (pilot) => {
        this.selectedPilot.set(pilot);

        this.pilotLoading.set(false);
      },

      error: (error) => {
        console.error(' Pilot error:', error);

        this.selectedPilot.set(null);
        this.pilotLoading.set(false);
      },
    });
  }

  // ACTUAL POSITION

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

  // ACTUAL WIDTH

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

  // MATH FOR TEMPLATE

  protected readonly Math = Math;
}
