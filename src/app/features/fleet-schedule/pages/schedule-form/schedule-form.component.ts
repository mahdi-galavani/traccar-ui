import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment-jalaali';
import { FleetScheduleApiService } from '../../../../core/services/api/fleet-schedule-api.service';
import { AirplaneApiService } from '../../../../core/services/api/airplane-api.service';
import { AirportApiService } from '../../../../core/services/api/airport-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FlightCrewFormComponent } from '../../components/flight-crew-form/flight-crew-form.component';
import { SelectOption } from '../../../../core/models/base/crud-field.model';
import { AirplaneDto } from '../../../../core/models/airplane.model';
import { FleetScheduleDto, FleetScheduleType } from '../../../../core/models/fleet-schedule.model';

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
  private airportApi = inject(AirportApiService);
  private notification = inject(NotificationService);

  readonly isEdit = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  readonly typeOptions = signal<SelectOption[]>([]);
  readonly airplaneOptions = signal<SelectOption[]>([]);
  readonly airportOptions = signal<SelectOption[]>([]);

  readonly airplanesList = signal<AirplaneDto[]>([]);

  readonly form = new FormGroup({
    id: new FormControl<string | null>(null),
    version: new FormControl<number | null>(null),
    type: new FormControl<FleetScheduleType | null>(null, Validators.required),
    airplane: new FormControl<string | null>(null, Validators.required),
    plannedStartTime: new FormControl<string | null>(null, Validators.required),
    plannedEndTime: new FormControl<string | null>(null, Validators.required),
    flightNumber: new FormControl<string | null>(null),
    departure: new FormControl<string | null>(null, Validators.required),
    arrival: new FormControl<string | null>(null, Validators.required),
    crew: new FormArray([]),
  });

  readonly airplaneIdSignal = toSignal(
    this.form.controls.airplane.valueChanges as import('rxjs').Observable<string | null>,
    { initialValue: null }
  );

  readonly selectedAirplaneDetails = computed(() => {
    const selectedId = this.airplaneIdSignal();
    const list = this.airplanesList();
    if (!selectedId || list.length === 0) return null;

    return list.find(a => String(a.id).trim() === String(selectedId).trim()) || null;
  });

  get crewArray(): FormArray {
    return this.form.get('crew') as FormArray;
  }

  ngOnInit(): void {
    this.loadInitialData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.loadSchedule(id);
    } else {
      // فقط در حالت ایجاد، listener بگذاریم
      this.form.get('type')?.valueChanges.subscribe((t) => this.handleTypeChange(t));
    }
  }

  private loadInitialData(): void {
    this.airplaneApi.load().subscribe((airplanes) => {
      this.airplanesList.set(airplanes);
      this.airplaneOptions.set(
        airplanes.map((a) => ({ label: a.register!, value: a.id! }))
      );
    });

    this.airportApi.load().subscribe((airports) => {
      this.airportOptions.set(
        airports.map((a) => ({ label: `${a.name} (${a.code})`, value: a.id! }))
      );
    });

    this.typeOptions.set([
      { label: 'fleet_schedule.types.flight', value: 'FLIGHT' },
      { label: 'fleet_schedule.types.check', value: 'CHECK' },
      { label: 'fleet_schedule.types.dfdr', value: 'DFDR' }
    ]);
  }

  private loadSchedule(id: string): void {
    this.loading.set(true);

    this.api.loadById(id).subscribe({
      next: (dto: FleetScheduleDto) => {
        // Patch اصلی
        this.form.patchValue({
          id: dto.id,
          version: dto.version,
          type: dto.type,
          airplane: dto.airplane?.id ? String(dto.airplane.id) : null,
          plannedStartTime: dto.plannedStartTime ? moment(dto.plannedStartTime).format('YYYY-MM-DDTHH:mm') : null,
          plannedEndTime: dto.plannedEndTime ? moment(dto.plannedEndTime).format('YYYY-MM-DDTHH:mm') : null,
          flightNumber: dto.flight?.number || null,
          departure: dto.departure?.id ? String(dto.departure.id) : null,
          arrival: dto.arrival?.id ? String(dto.arrival.id) : null,
        });

        // مهم: بعد از patch، handleTypeChange را صدا بزنیم
        this.handleTypeChange(dto.type);

        // پر کردن crew فقط در حالت FLIGHT
        if (dto.type === 'FLIGHT' && dto.flight?.crew?.length) {
          this.crewArray.clear();
          dto.flight.crew.forEach((c) => {
            this.crewArray.push(
              new FormGroup({
                personId: new FormControl(c.person?.id, Validators.required),
                crewJobId: new FormControl(c.crewJob?.id, Validators.required),
              })
            );
          });
        }

        this.loading.set(false);
      },
      error: () => {
        this.notification.error('common.error');
        this.loading.set(false);
      },
    });
  }

  private handleTypeChange(type: FleetScheduleType | null): void {
    const fnControl = this.form.get('flightNumber');

    if (type === 'FLIGHT') {
      fnControl?.setValidators([Validators.required]);
      // اگر crew خالی بود، یک سطر پیش‌فرض اضافه کن
      if (this.crewArray.length === 0) {
        this.crewArray.push(this.buildCrewRow());
      }
    } else {
      fnControl?.clearValidators();
      this.crewArray.clear();
      this.form.get('flightNumber')?.setValue(null);
    }

    fnControl?.updateValueAndValidity();
  }

  private buildCrewRow(): FormGroup {
    return new FormGroup({
      personId: new FormControl(null, Validators.required),
      crewJobId: new FormControl(null, Validators.required),
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  cancel(): void {
    this.router.navigate(['/fleet-schedule']);
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
      type: v.type!,
      airplane: { id: v.airplane! },
      departure: { id: v.departure! },
      arrival: { id: v.arrival! },
      plannedStartTime: `${v.plannedStartTime!}:00Z`,
      plannedEndTime: `${v.plannedEndTime!}:00Z`,
      status: 'SCHEDULED',
    };

    // فقط در حالت FLIGHT اطلاعات پرواز را بفرست
    if (v.type === 'FLIGHT' && v.flightNumber) {
      dto.flight = {
        number: v.flightNumber,
        crew: (v.crew as any[]).map((c: any) => ({
          person: { id: c.personId },
          crewJob: { id: c.crewJobId },
        })),
      };
    }

    this.api.save(dto).subscribe({
      next: () => {
        this.notification.success('common.saved');
        this.router.navigate(['/fleet-schedule']);
      },
      error: (err) => {
        console.error(err);
        this.notification.error('common.error');
      },
    });
  }
}
