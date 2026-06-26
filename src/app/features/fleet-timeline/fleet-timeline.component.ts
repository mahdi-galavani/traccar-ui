import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FleetScheduleApiService } from '../../core/services/api/fleet-schedule-api.service';
import { AirplaneApiService } from '../../core/services/api/airplane-api.service';
import { AirplaneDto } from '../../core/models/airplane.model';
import { FleetScheduleDto, FleetScheduleType } from '../../core/models/fleet-schedule.model';
import { TranslatePipe } from '@ngx-translate/core';

export type TimelineViewMode = '1_WEEK' | '2_WEEKS' | '1_MONTH';

@Component({
  selector: 'app-fleet-timeline',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './fleet-timeline.component.html',
  styleUrl: './fleet-timeline.component.css'
})
export class FleetTimelineComponent implements OnInit {
  private scheduleApi = inject(FleetScheduleApiService);
  private airplaneApi = inject(AirplaneApiService);

  readonly viewMode = signal<TimelineViewMode>('1_WEEK');
  readonly airplanes = signal<AirplaneDto[]>([]);
  readonly selectedAirplaneId = signal<string | null>(null);
  readonly schedules = signal<FleetScheduleDto[]>([]);
  readonly loading = signal(false);

  readonly WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  ngOnInit(): void {
    this.loadAirplanes();
    this.loadSchedules();
  }

  loadAirplanes(): void {
    this.airplaneApi.load().subscribe(planes => {
      this.airplanes.set(planes);
      if (planes.length > 0 && !this.selectedAirplaneId()) {
        this.selectedAirplaneId.set(planes[0].id!);
      }
    });
  }

  loadSchedules(): void {
    this.loading.set(true);
    this.scheduleApi.load().subscribe({
      next: (data) => {
        // فقط پروازها (FLIGHT) نمایش داده شوند
        this.schedules.set(data.filter(s => s.type === 'FLIGHT'));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  readonly currentAirplaneSchedules = computed(() => {
    const planeId = this.selectedAirplaneId();
    return this.schedules().filter(s => s.airplane?.id === planeId);
  });

  readonly currentAirplaneDetails = computed(() => {
    return this.airplanes().find(p => p.id === this.selectedAirplaneId()) ?? null;
  });

  // محاسبه موقعیت و طول بلاک پرواز بر اساس plannedStartTime / plannedEndTime
  getFlightStyle(schedule: FleetScheduleDto): { [key: string]: string } {
    if (!schedule.plannedStartTime || !schedule.plannedEndTime) return {};

    const start = new Date(schedule.plannedStartTime);
    const end = new Date(schedule.plannedEndTime);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    let durationMinutes = endMinutes - startMinutes;

    // پروازهایی که به روز بعد می‌رسند
    if (durationMinutes <= 0) {
      durationMinutes = (1440 - startMinutes) + endMinutes;
    }

    const leftPercent = (startMinutes / 1440) * 100;
    const widthPercent = (durationMinutes / 1440) * 100;

    return {
      'left': `${leftPercent}%`,
      'width': `${widthPercent}%`,
      'position': 'absolute'
    };
  }

  // بررسی روز پرواز (بر اساس ISO weekday)
  isFlightOnDay(schedule: FleetScheduleDto, dayIndex: number): boolean {
    if (!schedule.plannedStartTime) return false;
    const date = new Date(schedule.plannedStartTime);
    let day = date.getDay(); // 0 = Sunday
    const isoDay = day === 0 ? 6 : day - 1; // Monday = 0
    return isoDay === dayIndex;
  }

  switchView(mode: TimelineViewMode): void {
    this.viewMode.set(mode);
    // TODO: در آینده فیلتر بر اساس تاریخ اعمال شود
  }

  selectAirplane(id: string): void {
    this.selectedAirplaneId.set(id);
  }

  getAirportCode(airport: any): string {
    if (!airport) return '---';
    return airport.code || airport.id?.substring(0, 4) || 'N/A';
  }
}
