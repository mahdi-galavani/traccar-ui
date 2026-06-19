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

  // وضعیت‌های واکنشی (Signals)
  readonly viewMode = signal<TimelineViewMode>('1_WEEK');
  readonly airplanes = signal<AirplaneDto[]>([]);
  readonly selectedAirplaneId = signal<string | null>(null);
  readonly schedules = signal<FleetScheduleDto[]>([]);
  readonly loading = signal(false);

  // روزهای هفته برای نمای ۱ هفته‌ای (شروع از دوشنبه بر اساس استاندارد هوانوردی ISO)
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
        this.schedules.set(data.filter(s => s.type === 'FLIGHT'));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // فیلتر کردن پروازهای هواپیمای انتخاب شده
  readonly currentAirplaneSchedules = computed(() => {
    const planeId = this.selectedAirplaneId();
    return this.schedules().filter(s => s.airplane?.id === planeId);
  });

  // پیدا کردن مشخصات هواپیمای جاری برای هدر باکس
  readonly currentAirplaneDetails = computed(() => {
    return this.airplanes().find(p => p.id === this.selectedAirplaneId()) ?? null;
  });

  // محاسبه موقعیت افقی (Left) و عرض (Width) بلاک پرواز روی خط‌زمان ۲۴ ساعته یک روز
  getFlightStyle(schedule: FleetScheduleDto): { [key: string]: string } {
    if (!schedule.actualStartTime || !schedule.actualEndTime) return {};

    const start = new Date(schedule.actualStartTime);
    const end = new Date(schedule.actualEndTime);

    // محاسبه بر اساس دقیقه از ابتدای روز (0 تا 1440 دقیقه)
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    let durationMinutes = endMinutes - startMinutes;

    // هندل کردن پروازهایی که بامداد روز بعد می‌نشینند
    if (durationMinutes <= 0) {
      durationMinutes = (1440 - startMinutes) + endMinutes;
    }

    const leftPercent = (startMinutes / 1440) * 100;
    const widthPercent = (durationMinutes / 1440) * 100;

    return {
      'left': `${leftPercent}%`,
      'width': `${widthPercent}%`
    };
  }

  // بررسی اینکه پرواز متعلق به کدام روز هفته است (0 = یکشنبه، 1 = دوشنبه و...)
  isFlightOnDay(schedule: FleetScheduleDto, dayIndex: number): boolean {
    if (!schedule.actualStartTime) return false;
    const date = new Date(schedule.actualStartTime);
    // تبدیل یکشنبه (0) به انتهای هفته و دوشنبه به روز اول
    let day = date.getDay();
    const isoDay = day === 0 ? 6 : day - 1;
    return isoDay === dayIndex;
  }

  switchView(mode: TimelineViewMode): void {
    this.viewMode.set(mode);
    // در دنیای واقعی اینجا متد لود دیتای بازه زمانی جدید با پارامتر تاریخ صدا زده می‌شود
  }

  selectAirplane(id: string): void {
    this.selectedAirplaneId.set(id);
  }
}
