import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FleetScheduleApiService } from '../../core/services/api/fleet-schedule-api.service';
import { AirplaneApiService } from '../../core/services/api/airplane-api.service';
import { AirplaneDto } from '../../core/models/airplane.model';
import { FleetScheduleDto } from '../../core/models/fleet-schedule.model';
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
    this.startLiveClock();
  }

  private startLiveClock(): void {
    setInterval(() => {
      this.viewMode.set(this.viewMode()); // برای به‌روزرسانی computed
    }, 60000); // هر دقیقه
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
        this.schedules.set(data.filter(s => s.type === 'FLIGHT'));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  readonly currentAirplaneSchedules = computed(() => {
    const planeId = this.selectedAirplaneId();
    return this.schedules().filter(s =>
      s.airplane?.id === planeId || s.airplane?.id?.toString() === planeId
    );
  });

  readonly currentAirplaneDetails = computed(() => {
    return this.airplanes().find(p => p.id === this.selectedAirplaneId()) ?? null;
  });

  readonly currentTimePosition = computed(() => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    return `${(totalMinutes / 1440) * 100}%`;
  });

  getFlightStyle(schedule: FleetScheduleDto): { [key: string]: string } {
    if (!schedule.plannedStartTime || !schedule.plannedEndTime) return {};

    const start = new Date(schedule.plannedStartTime);
    const end = new Date(schedule.plannedEndTime);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    let endMinutes = end.getHours() * 60 + end.getMinutes();
    let durationMinutes = endMinutes - startMinutes;
    if (durationMinutes <= 0) durationMinutes += 1440;

    const leftPercent = (startMinutes / 1440) * 100;
    const widthPercent = (durationMinutes / 1440) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      position: 'absolute'
    };
  }

  isFlightOnDay(schedule: FleetScheduleDto, dayIndex: number): boolean {
    if (!schedule.plannedStartTime) return false;
    const date = new Date(schedule.plannedStartTime);
    const day = date.getDay();
    const isoDay = day === 0 ? 6 : day - 1;
    return isoDay === dayIndex;
  }

  switchView(mode: TimelineViewMode): void {
    this.viewMode.set(mode);
  }

  selectAirplane(id: string): void {
    this.selectedAirplaneId.set(id);
  }

  getAirportCode(airport: any): string {
    if (!airport) return '---';
    return airport.code || airport.id?.substring(0, 4) || 'N/A';
  }

  formatTime(isoString: string | undefined): string {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
