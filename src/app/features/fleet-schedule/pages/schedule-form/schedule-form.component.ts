import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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

  readonly isEdit = signal(false);
  readonly loading = signal(false);

  readonly airplaneOptions = signal<SelectOption[]>([]);
  readonly airportOptions = signal<SelectOption[]>([]);
  readonly allAirplanes = signal<AirplaneDto[]>([]);
  readonly selectedAirplaneDetails = signal<AirplaneDto | null>(null);

  readonly TYPES: FleetScheduleType[] = ['FLIGHT', 'CHECK', 'DFDR'];

  isJalaliMode = true;
  jalaliStartDisplay = '';
  jalaliEndDisplay = '';

  form = new FormGroup({
    id: new FormControl<string | null>(null),
    version: new FormControl<number | null>(null),
    airplane: new FormControl<string | null>(null, Validators.required),
    departure: new FormControl<string | null>(null, Validators.required),
    arrival: new FormControl<string | null>(null, Validators.required),
    plannedStartTime: new FormControl<string | null>(null, Validators.required),
    plannedEndTime: new FormControl<string | null>(null, Validators.required),
    type: new FormControl<FleetScheduleType | null>(null, Validators.required),

    flightNumber: new FormControl<string | null>(null),
    crew: new FormArray<FormGroup>([]),
  }, { validators: this.airportRouteValidator });

  get crewArray(): FormArray {
    return this.form.get('crew') as FormArray;
  }

  get isFlight(): boolean {
    return this.form.get('type')?.value === 'FLIGHT';
  }

  ngOnInit(): void {
    this.loadAirports();
    this.loadAirplanes();

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

    this.form.get('airplane')?.valueChanges.subscribe(id => this.syncSelectedAirplaneDetails(id));
    this.form.get('type')?.valueChanges.subscribe(type => this.updateFlightValidators(type));
  }

  private loadAirports() {
    this.airportApi.load().subscribe(airports => {
      this.airportOptions.set(
        airports.map(a => ({
          label: a.location?.title ? `${a.location.title} (${a.code})` : (a.code ?? ''),
          value: a.id!
        }))
      );
    });
  }

  private loadAirplanes() {
    this.airplaneApi.load().subscribe(planes => {
      this.allAirplanes.set(planes);
      this.airplaneOptions.set(planes.map(p => ({
        label: p.register ?? p.id!,
        value: p.id!
      })));
    });
  }

  private airportRouteValidator(control: AbstractControl): ValidationErrors | null {
    const from = control.get('departure')?.value;
    const to = control.get('arrival')?.value;
    return from && to && from === to ? { sameAirports: true } : null;
  }

  // ====================== تقویم ======================
  toggleCalendarMode() {
    this.isJalaliMode = !this.isJalaliMode;
  }

  onGregorianChange(type: 'start' | 'end', event: any) {
    const value = event.target.value;
    if (type === 'start') {
      this.jalaliStartDisplay = value ? moment(value).format('jYYYY/jMM/jDD HH:mm') : '';
    } else {
      this.jalaliEndDisplay = value ? moment(value).format('jYYYY/jMM/jDD HH:mm') : '';
    }
  }

  openJalaliPicker(type: 'start' | 'end') {
    // TODO: پیاده‌سازی picker شمسی (مثل jalali-angular یا flatpickr)
    console.log(`Jalali picker for ${type} - هنوز پیاده‌سازی نشده`);
  }

  getUtcPreview(type: 'start' | 'end'): string {
    const key = type === 'start' ? 'plannedStartTime' : 'plannedEndTime';
    const val = this.form.get(key)?.value;
    if (!val) return '—';
    try {
      return new Date(val + 'Z').toISOString().slice(0, 16).replace('T', ' ');
    } catch {
      return '—';
    }
  }

  getGregorianPreview(type: 'start' | 'end'): string {
    const key = type === 'start' ? 'plannedStartTime' : 'plannedEndTime';
    const val = this.form.get(key)?.value;
    if (!val) return '—';
    return moment(val).format('YYYY-MM-DD HH:mm');
  }

  private syncSelectedAirplaneDetails(airplaneId: string | null | undefined) {
    if (!airplaneId) {
      this.selectedAirplaneDetails.set(null);
      return;
    }
    const match = this.allAirplanes().find(p => p.id === airplaneId);
    this.selectedAirplaneDetails.set(match ?? null);
  }

  private patchForm(dto: FleetScheduleDto): void {
    this.form.patchValue({
      id: dto.id ?? null,
      version: dto.version ?? null,
      airplane: dto.airplane?.id ?? null,
      departure: dto.departure?.id ?? null,
      arrival: dto.arrival?.id ?? null,
      plannedStartTime: dto.plannedStartTime?.substring(0, 16) ?? null,
      plannedEndTime: dto.plannedEndTime?.substring(0, 16) ?? null,
      type: dto.type,
      flightNumber: dto.flight?.number ?? null,
    });

    this.syncSelectedAirplaneDetails(dto.airplane?.id);
    this.patchCrew(dto);
    this.updateFlightValidators(dto.type);

    // به‌روزرسانی نمایش شمسی
    if (dto.plannedStartTime) this.jalaliStartDisplay = moment(dto.plannedStartTime).format('jYYYY/jMM/jDD HH:mm');
    if (dto.plannedEndTime) this.jalaliEndDisplay = moment(dto.plannedEndTime).format('jYYYY/jMM/jDD HH:mm');
  }

  private patchCrew(dto: FleetScheduleDto) {
    this.crewArray.clear();
    const existingCrew = dto.flight?.crew ?? [];
    if (existingCrew.length > 0) {
      existingCrew.forEach((c: any) => {
        this.crewArray.push(new FormGroup({
          personId: new FormControl(c.person?.id ?? null, Validators.required),
          crewJobId: new FormControl(c.crewJob?.id ?? null, Validators.required),
        }));
      });
    } else {
      this.addCrewIfEmpty();
    }
  }

  private updateFlightValidators(type: FleetScheduleType | null) {
    const fields = ['flightNumber', 'departure', 'arrival'];
    if (type === 'FLIGHT') {
      fields.forEach(key => this.form.get(key)?.setValidators(Validators.required));
    } else {
      fields.forEach(key => this.form.get(key)?.clearValidators());
    }
    fields.forEach(key => this.form.get(key)?.updateValueAndValidity());
  }

  private addCrewIfEmpty(): void {
    if (this.crewArray.length === 0) {
      this.crewArray.push(this.buildCrewRow());
    }
  }

  private buildCrewRow(): FormGroup {
    return new FormGroup({
      personId: new FormControl(null, Validators.required),
      crewJobId: new FormControl(null, Validators.required),
    });
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
      departure: { id: v.departure! },
      arrival: { id: v.arrival! },
      plannedStartTime: `${v.plannedStartTime!}:00Z`,
      plannedEndTime: `${v.plannedEndTime!}:00Z`,
      type: v.type!,
      status: 'SCHEDULED',
    };

    if (v.type === 'FLIGHT') {
      dto.flight = {
        number: v.flightNumber!,
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
        this.notification.error('خطا در ذخیره اطلاعات');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/fleet-schedule']);
  }

  isInvalid(key: string): boolean {
    const control = this.form.get(key);
    return !!control && control.invalid && control.touched;
  }
}
