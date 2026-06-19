import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { FleetScheduleApiService } from '../../../../core/services/api/fleet-schedule-api.service';
import { AirplaneApiService } from '../../../../core/services/api/airplane-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FlightCrewFormComponent } from '../../components/flight-crew-form/flight-crew-form.component';
import { SelectOption } from '../../../../core/models/base/crud-field.model';
import {
  FleetScheduleDto,
  FleetScheduleStatus,
  FleetScheduleType,
} from '../../../../core/models/fleet-schedule.model';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, FlightCrewFormComponent, RouterModule],
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.css',
})
export class ScheduleFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(FleetScheduleApiService);
  private airplaneApi = inject(AirplaneApiService);
  private notification = inject(NotificationService);

  readonly isEdit = signal(false);
  readonly loading = signal(false);
  readonly airplaneOptions = signal<SelectOption[]>([]);

  readonly TYPES: FleetScheduleType[] = ['FLIGHT', 'CHECK', 'DFDR'];
  readonly STATUSES: FleetScheduleStatus[] = ['DRAFT', 'SCHEDULED', 'CANCELLED'];

  form = new FormGroup({
    id: new FormControl<string | null>(null),
    version: new FormControl<number | null>(null),
    airplane: new FormControl<string | null>(null, Validators.required),
    actualStartTime: new FormControl<string | null>(null, Validators.required),
    actualEndTime: new FormControl<string | null>(null, Validators.required),
    type: new FormControl<FleetScheduleType | null>(null, Validators.required),
    status: new FormControl<FleetScheduleStatus>('DRAFT', Validators.required),

    // فیلدهای اختصاصی پرواز
    flightNumber: new FormControl<string | null>(null),
    fromAirport: new FormControl<string | null>(null),
    toAirport: new FormControl<string | null>(null),
    firstClassSeat: new FormControl<number | null>(null),
    businessClassSeat: new FormControl<number | null>(null),
    economicClassSeat: new FormControl<number | null>(null),
    payload: new FormControl<number | null>(null),
    crew: new FormArray<FormGroup>([]),
  });

  get crewArray(): FormArray {
    return this.form.get('crew') as FormArray;
  }

  get isFlight(): boolean {
    return this.form.get('type')?.value === 'FLIGHT';
  }

  ngOnInit(): void {
    // بارگذاری لیست هواپیماها
    this.airplaneApi.load().subscribe((planes) => {
      this.airplaneOptions.set(planes.map((p) => ({ label: p.register ?? p.id!, value: p.id })));
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.loading.set(true);
      this.api.loadById(id).subscribe({
        next: (dto) => {
          this.patchForm(dto);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.addCrewIfEmpty();
    }

    // لایو کنترل وضعیت ولیدیشن‌ها بر اساس نوع برنامه
    this.form.get('type')?.valueChanges.subscribe((type) => {
      this.updateFlightValidators(type);
    });
  }

  private patchForm(dto: FleetScheduleDto): void {
    this.form.patchValue({
      id: dto.id ?? null,
      version: dto.version ?? null,
      airplane: dto.airplane?.id ?? null,
      actualStartTime: dto.actualStartTime ? dto.actualStartTime.substring(0, 16) : null,
      actualEndTime: dto.actualEndTime ? dto.actualEndTime.substring(0, 16) : null,
      type: dto.type,
      status: dto.status,
      flightNumber: dto.flight?.number ?? null,
      fromAirport: dto.flight?.from?.id ?? null,
      toAirport: dto.flight?.to?.id ?? null,
      firstClassSeat: dto.flight?.firstClassSeat ?? null,
      businessClassSeat: dto.flight?.businessClassSeat ?? null,
      economicClassSeat: dto.flight?.economicClassSeat ?? null,
      payload: dto.flight?.payload ?? null,
    });

    this.crewArray.clear();
    const existingCrew = dto.flight?.crew ?? [];
    if (existingCrew.length > 0) {
      existingCrew.forEach((c) => {
        this.crewArray.push(
          new FormGroup({
            personId: new FormControl(c.person?.id ?? null, Validators.required),
            crewJobId: new FormControl(c.crewJob?.id ?? null, Validators.required),
          }),
        );
      });
    } else {
      this.addCrewIfEmpty();
    }

    this.updateFlightValidators(dto.type);
  }

  private addCrewIfEmpty(): void {
    if (this.crewArray.length === 0) {
      this.crewArray.push(
        new FormGroup({
          personId: new FormControl(null, Validators.required),
          crewJobId: new FormControl(null, Validators.required),
        }),
      );
    }
  }

  private updateFlightValidators(type: FleetScheduleType | null): void {
    const flightFields = ['flightNumber', 'fromAirport', 'toAirport'];
    if (type === 'FLIGHT') {
      flightFields.forEach((key) => {
        this.form.get(key)?.setValidators(Validators.required);
        this.form.get(key)?.updateValueAndValidity();
      });
    } else {
      flightFields.forEach((key) => {
        this.form.get(key)?.clearValidators();
        this.form.get(key)?.updateValueAndValidity();
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    // ساخت مدل کاملاً مطابق با ساختار FleetScheduleDto پروازی
    const dto: FleetScheduleDto = {
      id: v.id ?? undefined,
      version: v.version ?? undefined,
      airplane: { id: v.airplane! },
      actualStartTime: v.actualStartTime! + ':00',
      actualEndTime: v.actualEndTime! + ':00',
      type: v.type!,
      status: v.status!,
    };

    if (v.type === 'FLIGHT') {
      dto.flight = {
        number: v.flightNumber!,
        from: { id: v.fromAirport! },
        to: { id: v.toAirport! },
        firstClassSeat: v.firstClassSeat ?? undefined,
        businessClassSeat: v.businessClassSeat ?? undefined,
        economicClassSeat: v.economicClassSeat ?? undefined,
        payload: v.payload ?? undefined,
        // 💡 استفاده از explicit casting برای هماهنگی با تایپ‌های سخت‌گیرانه مدل پرواز
        crew: (v.crew as any[]).map((c) => ({
          person: { id: c.personId } as any, // یا ساختار مدل شخص شما
          crewJob: { id: c.crewJobId } as any
        })),
      };
    }

    this.api.save(dto).subscribe(() => {
      this.notification.success('common.saved');
      this.router.navigate(['/fleet-schedule']);
    });
  }

  cancel(): void {
    this.router.navigate(['/fleet-schedule']);
  }

  isInvalid(key: string): boolean {
    const c = this.form.get(key);
    return !!c && c.invalid && c.touched;
  }
}
