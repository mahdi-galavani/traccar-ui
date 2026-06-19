import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { FleetScheduleApiService } from '../../../../core/services/api/fleet-schedule-api.service';
import { AirplaneApiService } from '../../../../core/services/api/airplane-api.service';
import { AirportApiService } from '../../../../core/services/api/airport-api.service'; // 👈 استفاده از سرویس اصلی فرودگاه
import { NotificationService } from '../../../../core/services/notification.service';
import { FlightCrewFormComponent } from '../../components/flight-crew-form/flight-crew-form.component';
import { SelectOption } from '../../../../core/models/base/crud-field.model';
import { AirplaneDto } from '../../../../core/models/airplane.model';
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
  private airportApi = inject(AirportApiService); // 👈 تصحیح تزریق سرویس فرودگاه
  private notification = inject(NotificationService);

  readonly isEdit = signal(false);
  readonly loading = signal(false);

  readonly airplaneOptions = signal<SelectOption[]>([]);
  readonly airportOptions = signal<SelectOption[]>([]); // گزینه‌های انتخاب فرودگاه

  readonly allAirplanes = signal<AirplaneDto[]>([]);
  readonly selectedAirplaneDetails = signal<AirplaneDto | null>(null);

  readonly TYPES: FleetScheduleType[] = ['FLIGHT', 'CHECK', 'DFDR'];
  private currentStatus: FleetScheduleStatus = 'DRAFT';

  form = new FormGroup({
    id: new FormControl<string | null>(null),
    version: new FormControl<number | null>(null),
    airplane: new FormControl<string | null>(null, Validators.required),
    actualStartTime: new FormControl<string | null>(null, Validators.required),
    actualEndTime: new FormControl<string | null>(null, Validators.required),
    type: new FormControl<FleetScheduleType | null>(null, Validators.required),

    // فیلدهای اختصاصی پرواز
    flightNumber: new FormControl<string | null>(null),
    fromAirport: new FormControl<string | null>(null),
    toAirport: new FormControl<string | null>(null),
    crew: new FormArray<FormGroup>([]),
  }, { validators: this.airportRouteValidator }); // اعمال ولیدیتور سفارشی برای مبدا و مقصد

  get crewArray(): FormArray {
    return this.form.get('crew') as FormArray;
  }

  get isFlight(): boolean {
    return this.form.get('type')?.value === 'FLIGHT';
  }

  ngOnInit(): void {
    // 👈 بارگذاری فرودگاه‌ها بر اساس مدل و سرویس دقیق فرودگاه شما
    this.airportApi.load().subscribe((airports) => {
      this.airportOptions.set(
        airports.map((a) => ({
          // نمایش به صورت: (THR) تهران یا اگر لوکیشن نداشت فقط کد فرودگاه
          label: a.location?.title ? `${a.location.title} (${a.code})` : (a.code ?? ''),
          value: a.id
        }))
      );
    });

    // بارگذاری هواپیماها
    this.airplaneApi.load().subscribe((planes) => {
      this.allAirplanes.set(planes);
      this.airplaneOptions.set(planes.map((p) => ({ label: p.register ?? p.id!, value: p.id })));
      this.syncSelectedAirplaneDetails(this.form.get('airplane')?.value);
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

    this.form.get('airplane')?.valueChanges.subscribe((airplaneId) => {
      this.syncSelectedAirplaneDetails(airplaneId);
    });

    this.form.get('type')?.valueChanges.subscribe((type) => {
      this.updateFlightValidators(type);
    });
  }

  // ولیدیتور سفارشی برای عدم یکسان بودن مبدا و مقصد
  private airportRouteValidator(control: AbstractControl): ValidationErrors | null {
    const from = control.get('fromAirport')?.value;
    const to = control.get('toAirport')?.value;

    if (from && to && from === to) {
      return { sameAirports: true };
    }
    return null;
  }

  private syncSelectedAirplaneDetails(airplaneId: string | null | undefined): void {
    if (!airplaneId) {
      this.selectedAirplaneDetails.set(null);
      return;
    }
    const match = this.allAirplanes().find(p => p.id === airplaneId);
    this.selectedAirplaneDetails.set(match ?? null);
  }

  private patchForm(dto: FleetScheduleDto): void {
    this.currentStatus = dto.status!;

    this.form.patchValue({
      id: dto.id ?? null,
      version: dto.version ?? null,
      airplane: dto.airplane?.id ?? null,
      actualStartTime: dto.actualStartTime ? dto.actualStartTime.substring(0, 16) : null,
      actualEndTime: dto.actualEndTime ? dto.actualEndTime.substring(0, 16) : null,
      type: dto.type,
      flightNumber: dto.flight?.number ?? null,
      fromAirport: dto.flight?.from?.id ?? null,
      toAirport: dto.flight?.to?.id ?? null,
    });

    this.syncSelectedAirplaneDetails(dto.airplane?.id);

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

    const dto: FleetScheduleDto = {
      id: v.id ?? undefined,
      version: v.version ?? undefined,
      airplane: { id: v.airplane! },
      actualStartTime: v.actualStartTime! + ':00',
      actualEndTime: v.actualEndTime! + ':00',
      type: v.type!,
      status: this.currentStatus,
    };

    if (v.type === 'FLIGHT') {
      dto.flight = {
        number: v.flightNumber!,
        from: { id: v.fromAirport! },
        to: { id: v.toAirport! },
        firstClassSeat: this.selectedAirplaneDetails()?.firstClassSeat ?? undefined,
        businessClassSeat: this.selectedAirplaneDetails()?.businessClassSeat ?? undefined,
        economicClassSeat: this.selectedAirplaneDetails()?.economicClassSeat ?? undefined,
        payload: this.selectedAirplaneDetails()?.payload ?? undefined,
        crew: (v.crew as any[]).map((c) => ({
          person: { id: c.personId } as any,
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
