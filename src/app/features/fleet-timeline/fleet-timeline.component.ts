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
  readonly selectedAirplaneId = signal<string | null>(null);
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

  // =========================
  // CLOCK
  // =========================

  private startLiveClock(): void {
    this.clockInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 10000);
  }

  // =========================
  // LOAD AIRPLANES
  // =========================

  loadAirplanes(): void {
    this.airplaneApi.load().subscribe(planes => {
      this.airplanes.set(planes);

      if (planes.length > 0 && !this.selectedAirplaneId()) {
        this.selectedAirplaneId.set(planes[0].id!);
      }
    });
  }

  // =========================
  // LOAD SCHEDULES
  // =========================

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

    return this.schedules().filter(s =>
      s.airplane?.id === planeId ||
      s.airplane?.id?.toString() === planeId
    );
  });

  readonly scheduleSegments = computed(() => {

    return this.currentAirplaneSchedules()
      .flatMap(schedule => this.createSegments(schedule));

  });

  private parseLocalDateTime(value: string): Date {

    // حذف timezone اگر وجود دارد
    const cleaned = value
      .replace('Z', '')
      .split('+')[0]
      .split('-')
      .slice(0, 3)
      .join('-') + 'T' + value.split('T')[1]?.split('+')[0]?.split('Z')[0];

    const [datePart, timePart] = cleaned.split('T');

    const [year, month, day] = datePart.split('-').map(Number);

    const [hour = 0, minute = 0, second = 0] =
      (timePart || '00:00:00').split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute, second, 0);
  }

  private createSegments(schedule: FleetScheduleDto): ScheduleSegment[] {

    const segments: ScheduleSegment[] = [];

    const start = TimeUtils.parseUTC(schedule.plannedStartTime);
    const end = TimeUtils.parseUTC(schedule.plannedEndTime);

    const startDay = new Date(Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate()
    ));

    const endDay = new Date(Date.UTC(
      end.getUTCFullYear(),
      end.getUTCMonth(),
      end.getUTCDate()
    ));

    for (
      let day = new Date(startDay);
      day <= endDay;
      day.setUTCDate(day.getUTCDate() + 1)
    ) {

      const isFirst = TimeUtils.getUTCDateKey(day) === TimeUtils.getUTCDateKey(start);
      const isLast = TimeUtils.getUTCDateKey(day) === TimeUtils.getUTCDateKey(end);

      const startMinutes = isFirst
        ? TimeUtils.toUTCMinutes(start)
        : 0;

      const endMinutes = isLast
        ? TimeUtils.toUTCMinutes(end)
        : 1440;

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

    return this.scheduleSegments()
      .filter(segment => segment.dayIndex === dayIndex);

  }

  getSchedule(segment: ScheduleSegment): FleetScheduleDto {
    return segment.schedule;
  }

  readonly currentAirplaneDetails = computed(() => {
    return this.airplanes().find(p => p.id === this.selectedAirplaneId()) ?? null;
  });

  // =========================
  // TIME HELPERS
  // =========================

  readonly currentTimePosition = computed(() => {

    const now = new Date();

    const totalMinutes =
      now.getUTCHours() * 60 + now.getUTCMinutes();

    const positionPercent = (totalMinutes / 1440) * 100;

    return `${Math.min(Math.max(positionPercent, 0), 100)}%`;
  });

  readonly currentTimeString = computed(() => {
    const now = this.currentTime();

    return now.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  });

  readonly showCurrentTimeLine = computed(() => {
    return true;
  });

  // =========================
  // RESPONSIVE BLOCK ENGINE
  // =========================

  getBlockSizeBySegment(segment: ScheduleSegment): 'xs' | 'sm' | 'md' | 'lg' {

    const duration =
      segment.endMinutes - segment.startMinutes;

    if (duration <= 45)
      return 'xs';

    if (duration <= 90)
      return 'sm';

    if (duration <= 240)
      return 'md';

    return 'lg';

  }

  // =========================
  // TYPE ICONS
  // =========================

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

  // =========================
  // AIRPORT HELPERS
  // =========================

  getAirportCode(airport: any): string {
    if (!airport) return '---';
    return airport.code || airport.id?.substring(0, 4) || 'N/A';
  }

  formatTime(isoString: string | undefined): string {
    if (!isoString) return '';

    return TimeUtils.formatUTC(isoString);
  }

  // =========================
  // VIEW / ACTIONS
  // =========================

  switchView(mode: TimelineViewMode): void {
    this.viewMode.set(mode);
  }

  selectAirplane(id: string): void {
    this.selectedAirplaneId.set(id);
  }

  // =========================
  // POSITIONING ON TIMELINE
  // =========================

  getSegmentStyle(segment: ScheduleSegment): { [key: string]: string } {

    const leftPercent =
      (segment.startMinutes / 1440) * 100;

    const widthPercent =
      ((segment.endMinutes - segment.startMinutes) / 1440) * 100;

    return {

      position: 'absolute',

      left: `${leftPercent}%`,

      width: `${widthPercent}%`

    };

  }

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

  getLanesForDay(schedules: FleetScheduleDto[]): FleetScheduleDto[][] {

    const sorted = [...schedules].sort((a, b) =>
      new Date(a.plannedStartTime).getTime() -
      new Date(b.plannedStartTime).getTime()
    );

    const lanes: FleetScheduleDto[][] = [];

    for (const schedule of sorted) {

      const start = new Date(schedule.plannedStartTime).getTime();
      const end = new Date(schedule.plannedEndTime).getTime();

      let placed = false;

      for (const lane of lanes) {

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
      if (lanes[i].includes(schedule)) {
        return i;
      }
    }

    return 0;
  }

  getLaneTop(index: number): string {
    return `${index * 34}px`;
  }

  getAirplane(schedule: FleetScheduleDto): AirplaneDto | null {
    return (schedule.airplane as AirplaneDto) ?? null;
  }
}
