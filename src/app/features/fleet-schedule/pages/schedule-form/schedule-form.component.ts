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
import {
  FleetScheduleDto,
  FleetScheduleType,
  FleetScheduleStatus
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
  private airportApi = inject(AirportApiService);
  private notification = inject(NotificationService);

  readonly isEdit = signal(false);
  readonly loading = signal(false);

  readonly airplaneOptions = signal<SelectOption[]>([]);
  readonly airportOptions = signal<SelectOption[]>([]);
  readonly allAirplanes = signal<AirplaneDto[]>([]);
  readonly selectedAirplaneDetails = signal<AirplaneDto | null>(null);

  readonly TYPES: FleetScheduleType[] = ['FLIGHT', 'CHECK', 'DFDR'];
  private currentStatus: FleetScheduleStatus = 'DRAFT';

  // مدیریت تقویم
  isJalaliMode = true;
  jalaliStartDisplay = '';
  jalaliEndDisplay = '';

  form = new FormGroup({
    id: new FormControl<string | null>(null),
    version: new FormControl<number | null>(null),
    airplane: new FormControl<string | null>(null, Validators.required),
    actualStartTime: new FormControl<string | null>(null, Validators.required),
    actualEndTime: new FormControl<string | null>(null, Validators.required),
    type: new FormControl<FleetScheduleType | null>(null, Validators.required),

    flightNumber: new FormControl<string | null>(null),
    fromAirport: new FormControl<string | null>(null),
    toAirport: new FormControl<string | null>(null),
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
    const from = control.get('fromAirport')?.value;
    const to = control.get('toAirport')?.value;
    return from && to && from === to ? { sameAirports: true } : null;
  }

  // ====================== تقویم شمسی / میلادی ======================
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
    console.log(`Jalali picker for ${type}`);
    // TODO: پیاده‌سازی picker شمسی
  }

  getUtcPreview(type: 'start' | 'end'): string {
    const key = type === 'start' ? 'actualStartTime' : 'actualEndTime';
    const val = this.form.get(key)?.value;
    if (!val) return '—';
    try {
      return new Date(val + 'Z').toISOString().slice(0, 16).replace('T', ' ');
    } catch {
      return '—';
    }
  }

  getGregorianPreview(type: 'start' | 'end'): string {
    const key = type === 'start' ? 'actualStartTime' : 'actualEndTime';
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
    this.currentStatus = dto.status ?? 'DRAFT';

    const startTime = dto.actualStartTime ? dto.actualStartTime.substring(0, 16) : null;
    const endTime = dto.actualEndTime ? dto.actualEndTime.substring(0, 16) : null;

    this.form.patchValue({
      id: dto.id ?? null,
      version: dto.version ?? null,
      airplane: dto.airplane?.id ?? null,
      actualStartTime: startTime,
      actualEndTime: endTime,
      type: dto.type,
      flightNumber: dto.flight?.number ?? null,
      fromAirport: dto.flight?.from?.id ?? null,
      toAirport: dto.flight?.to?.id ?? null,
    });

    if (startTime) this.jalaliStartDisplay = moment(startTime).format('jYYYY/jMM/jDD HH:mm');
    if (endTime) this.jalaliEndDisplay = moment(endTime).format('jYYYY/jMM/jDD HH:mm');

    this.syncSelectedAirplaneDetails(dto.airplane?.id);
    this.patchCrew(dto);
    this.updateFlightValidators(dto.type);
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
    const fields = ['flightNumber', 'fromAirport', 'toAirport'];
    if (type === 'FLIGHT') {
      fields.forEach(key => this.form.get(key)?.setValidators(Validators.required));
    } else {
      fields.forEach(key => this.form.get(key)?.clearValidators());
    }
    fields.forEach(key => this.form.get(key)?.updateValueAndValidity());
  }

  private addCrewIfEmpty(): void {
    if (this.crewArray.length === 0) {
      this.crewArray.push(new FormGroup({
        personId: new FormControl(null, Validators.required),
        crewJobId: new FormControl(null, Validators.required),
      }));
    }
  }

  // ====================== Submit (رفع خطای TS2322) ======================
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    // چون validation رد شده، این مقادیر حتماً وجود دارند
    const dto: FleetScheduleDto = {
      id: v.id ?? undefined,
      version: v.version ?? undefined,
      airplane: { id: v.airplane! },
      actualStartTime: `${v.actualStartTime!}:00Z`,     // ! اضافه شد
      actualEndTime: `${v.actualEndTime!}:00Z`,       // ! اضافه شد
      type: v.type!,
      status: this.currentStatus,
    };

    if (v.type === 'FLIGHT') {
      dto.flight = {
        number: v.flightNumber!,
        from: { id: v.fromAirport! },
        to: { id: v.toAirport! },
        crew: (v.crew as any[]).map((c: any) => ({
          person: { id: c.personId } as any,
          crewJob: { id: c.crewJobId } as any,
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
