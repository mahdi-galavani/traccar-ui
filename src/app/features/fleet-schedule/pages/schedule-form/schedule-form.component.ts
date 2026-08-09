import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_TIMEPICKER_CONFIG, MatTimepickerConfig, MatTimepickerModule } from '@angular/material/timepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    FlightCrewFormComponent,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
  ],
  providers:[
    provideNativeDateAdapter(),
    {
      provide: MAT_TIMEPICKER_CONFIG,
      useValue: { format: '24h' } as MatTimepickerConfig
    },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
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
  readonly isSaving = signal<boolean>(false);

  readonly typeOptions = signal<SelectOption[]>([]);
  readonly airplaneOptions = signal<SelectOption[]>([]);
  readonly airportOptions = signal<SelectOption[]>([]);
  readonly airplanesList = signal<AirplaneDto[]>([]);

  // ========================================================================
  // فرم اصلی
  // ========================================================================
  readonly form = new FormGroup({
    id: new FormControl<string | null>(null),
    version: new FormControl<number | null>(null),
    type: new FormControl<FleetScheduleType | null>(null, Validators.required),
    airplane: new FormControl<string | null>(null, Validators.required),
    departure: new FormControl<string | null>(null, Validators.required),
    arrival: new FormControl<string | null>(null, Validators.required),

    // فیلدهای جداگانه تاریخ و زمان (برای Material Datepicker و Timepicker)
    plannedStartDate: new FormControl<Date | null>(null, Validators.required),
    plannedStartTime: new FormControl<string | null>(null, Validators.required),
    plannedEndDate: new FormControl<Date | null>(null, Validators.required),
    plannedEndTime: new FormControl<string | null>(null, Validators.required),

    // فیلدهای پرواز
    flightNumber: new FormControl<string | null>(null),
    flightId: new FormControl<string | null>(null),
    flightVersion: new FormControl<number | null>(null),

    // خدمه پرواز
    crew: new FormArray([]),
  });

  // ========================================================================
  // Computed Signals
  // ========================================================================
  readonly airplaneIdSignal = toSignal(
    this.form.controls.airplane.valueChanges,
    { initialValue: null },
  );

  readonly selectedAirplaneDetails = computed(() => {
    const selectedId = this.airplaneIdSignal();
    const list = this.airplanesList();
    if (!selectedId || list.length === 0) return null;
    return list.find((a) => String(a.id).trim() === String(selectedId).trim()) || null;
  });

  get crewArray(): FormArray {
    return this.form.get('crew') as FormArray;
  }

  // ========================================================================
  // INIT
  // ========================================================================
  ngOnInit(): void {
    this.loadInitialData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.loadSchedule(id);
    } else {
      this.form.get('type')?.valueChanges.subscribe((t) => this.handleTypeChange(t));
    }
  }

  // ========================================================================
  // بارگذاری داده‌های اولیه
  // ========================================================================
  private loadInitialData(): void {
    this.airplaneApi.load().subscribe((airplanes) => {
      this.airplanesList.set(airplanes);
      this.airplaneOptions.set(
        airplanes.map((a) => ({ label: a.register!, value: a.id! })),
      );
    });

    this.airportApi.load().subscribe((airports) => {
      this.airportOptions.set(
        airports.map((a) => ({ label: `${a.name} (${a.code})`, value: a.id! })),
      );
    });

    this.typeOptions.set([
      { label: 'fleet_schedule.types.flight', value: 'FLIGHT' },
      { label: 'fleet_schedule.types.check', value: 'CHECK' },
      { label: 'fleet_schedule.types.dfdr', value: 'DFDR' },
    ]);
  }

  // ========================================================================
  // بارگذاری برای ویرایش
  // ========================================================================
  private loadSchedule(id: string): void {
    this.loading.set(true);
    this.api.loadById(id).subscribe({
      next: (dto: FleetScheduleDto) => {
        let startDate: Date | null = null;
        let startTime: string | null = null;
        let endDate: Date | null = null;
        let endTime: string | null = null;

        if (dto.plannedStartTime) {
          const m = moment(dto.plannedStartTime);
          if (m.isValid()) {
            startDate = m.toDate();
            startTime = m.format('HH:mm');
          }
        }
        if (dto.plannedEndTime) {
          const m = moment(dto.plannedEndTime);
          if (m.isValid()) {
            endDate = m.toDate();
            endTime = m.format('HH:mm');
          }
        }

        this.form.patchValue({
          id: dto.id,
          version: dto.version,
          type: dto.type,
          airplane: dto.airplane?.id ? String(dto.airplane.id) : null,
          plannedStartDate: startDate,
          plannedStartTime: startTime,
          plannedEndDate: endDate,
          plannedEndTime: endTime,
          flightNumber: dto.flight?.number || null,
          flightId: dto.flight?.id || null,
          flightVersion: dto.flight?.version ?? null,
          departure: dto.departure?.id ? String(dto.departure.id) : null,
          arrival: dto.arrival?.id ? String(dto.arrival.id) : null,
        });

        this.handleTypeChange(dto.type);

        if (dto.type === 'FLIGHT' && dto.flight?.crew?.length) {
          this.crewArray.clear();
          dto.flight.crew.forEach((c) => {
            this.crewArray.push(
              new FormGroup({
                id: new FormControl(c.id),
                version: new FormControl(c.version),
                personId: new FormControl(c.person?.id, Validators.required),
                crewJobId: new FormControl(c.crewJob?.id, Validators.required),
              }),
            );
          });
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ loadSchedule error:', err);
        this.notification.error('common.error');
        this.loading.set(false);
      },
    });
  }

  // ========================================================================
  // مدیریت تغییر نوع (FLIGHT/CHECK/DFDR)
  // ========================================================================
  private handleTypeChange(type: FleetScheduleType | null): void {
    const fnControl = this.form.get('flightNumber');

    if (type === 'FLIGHT') {
      fnControl?.setValidators([Validators.required]);
      if (this.crewArray.length === 0) {
        this.crewArray.push(this.buildCrewRow());
      }
    } else {
      fnControl?.clearValidators();
      this.crewArray.clear();
      this.form.get('flightNumber')?.setValue(null);
      this.form.get('flightId')?.setValue(null);
      this.form.get('flightVersion')?.setValue(null);
    }

    fnControl?.updateValueAndValidity();
  }

  private buildCrewRow(): FormGroup {
    return new FormGroup({
      id: new FormControl(null),
      version: new FormControl(null),
      personId: new FormControl(null, Validators.required),
      crewJobId: new FormControl(null, Validators.required),
    });
  }

  // ========================================================================
  // اعتبارسنجی نمایشی
  // ========================================================================
  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // ========================================================================
  // نمایش همه خطاها (برای دکمه ذخیره)
  // ========================================================================
  private markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach((c) => {
          c.markAsTouched();
          c.updateValueAndValidity();
        });
      } else {
        control?.markAsTouched();
        control?.updateValueAndValidity();
      }
    });
  }

  // ========================================================================
  // لغو
  // ========================================================================
  cancel(): void {
    this.router.navigate(['/fleet-schedule']);
  }

  // ========================================================================
  // ذخیره (نسخه کامل اصلاح‌شده)
  // ========================================================================
  submit(): void {
    // 1. بررسی اعتبار فرم
    if (this.form.invalid) {
      console.log('⛔ فرم نامعتبر است. خطاها:');
      this.markAllAsTouched();
      this.logFormErrors();
      this.notification.error('validation.invalid_form');
      return;
    }

    // 2. دریافت مقادیر خام
    const v = this.form.getRawValue();
    console.log('📋 مقادیر فرم:', {
      plannedStartDate: v.plannedStartDate,
      plannedStartTime: v.plannedStartTime,
      plannedEndDate: v.plannedEndDate,
      plannedEndTime: v.plannedEndTime,
      type: v.type,
      airplane: v.airplane,
      departure: v.departure,
      arrival: v.arrival,
    });

    // 3. ترکیب تاریخ و زمان
    const startDateTime = this.combineDateAndTime(v.plannedStartDate, v.plannedStartTime);
    const endDateTime = this.combineDateAndTime(v.plannedEndDate, v.plannedEndTime);

    console.log('🕐 تاریخ‌های ترکیب‌شده:', { startDateTime, endDateTime });

    if (!startDateTime || !endDateTime) {
      console.error('❌ ترکیب تاریخ و زمان ناموفق بود');
      this.notification.error('validation.invalid_datetime');
      return;
    }

    // 4. اعتبارسنجی منطقی: شروع باید قبل از پایان باشد
    if (new Date(startDateTime) >= new Date(endDateTime)) {
      console.error('❌ زمان شروع باید قبل از زمان پایان باشد');
      this.notification.error('validation.end_before_start');
      return;
    }

    // 5. ساخت DTO
    const dto: FleetScheduleDto = {
      id: v.id ?? undefined,
      version: v.version ?? undefined,
      type: v.type!,
      airplane: { id: v.airplane! },
      departure: { id: v.departure! },
      arrival: { id: v.arrival! },
      plannedStartTime: startDateTime,
      plannedEndTime: endDateTime,
      status: 'SCHEDULED',
    };

    // 6. اضافه کردن اطلاعات پرواز (فقط برای FLIGHT)
    if (v.type === 'FLIGHT' && v.flightNumber) {
      dto.flight = {
        id: v.flightId ?? undefined,
        version:
          v.flightVersion !== null && v.flightVersion !== undefined
            ? Number(v.flightVersion)
            : 0,
        number: v.flightNumber,
        crew: (v.crew as any[]).map((c: any) => ({
          id: c.id ?? undefined,
          version:
            c.version !== null && c.version !== undefined
              ? Number(c.version)
              : undefined,
          person: { id: c.personId },
          crewJob: { id: c.crewJobId },
        })),
      };
    }

    console.log('📤 DTO ارسالی:', JSON.stringify(dto, null, 2));

    // 7. ارسال به سرور
    this.isSaving.set(true);

    this.api.save(dto).subscribe({
      next: (response) => {
        console.log('✅ ذخیره موفق:', response);
        this.isSaving.set(false);
        this.notification.success('common.saved');
        this.router.navigate(['/fleet-schedule']);
      },
      error: (err) => {
        console.error('❌ خطای ذخیره:', err);
        console.error('📝 جزئیات خطا:', {
          status: err.status,
          message: err.message,
          body: err.error,
        });
        this.isSaving.set(false);

        // نمایش پیغام خطای اختصاصی
        if (err.error?.message) {
          this.notification.error(err.error.message);
        } else if (err.status === 400) {
          this.notification.error('validation.bad_request');
        } else if (err.status === 409) {
          this.notification.error('validation.conflict');
        } else {
          this.notification.error('common.error');
        }
      },
    });
  }

  // ========================================================================
  // متد ترکیب تاریخ و زمان (نسخه مقاوم)
  // ========================================================================
  private combineDateAndTime(date: Date | null, time: string | Date | null): string | null {
    if (!date) {
      console.warn('⚠️ combineDateAndTime: date is null');
      return null;
    }
    if (!time) {
      console.warn('⚠️ combineDateAndTime: time is null');
      return null;
    }

    try {
      // Type assertion برای حل خطای TypeScript
      const timeAny = time as any;

      if (timeAny instanceof Date) {
        const hours = timeAny.getHours();
        const minutes = timeAny.getMinutes();
        const momentObj = moment(date).set({
          hour: hours,
          minute: minutes,
          second: 0,
          millisecond: 0,
        });
        if (!momentObj.isValid()) {
          console.error('❌ momentObj نامعتبر (Date time)');
          return null;
        }
        return momentObj.toISOString();
      }

      // حالت عادی: time یک رشته مثل "HH:MM" یا "HH:mm" است
      const timeStr = String(time).trim();
      const parts = timeStr.split(':');

      if (parts.length < 2) {
        console.error('❌ فرمت زمان نامعتبر:', timeStr);
        return null;
      }

      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);

      if (isNaN(hours) || isNaN(minutes)) {
        console.error('❌ مقادیر ساعت/دقیقه نامعتبر:', { hours, minutes });
        return null;
      }

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error('❌ محدوده ساعت/دقیقه نامعتبر:', { hours, minutes });
        return null;
      }

      const momentObj = moment(date).set({
        hour: hours,
        minute: minutes,
        second: 0,
        millisecond: 0,
      });

      if (!momentObj.isValid()) {
        console.error('❌ momentObj نامعتبر');
        return null;
      }

      const result = momentObj.toISOString();
      console.log('✅ combineDateAndTime موفق:', result);
      return result;
    } catch (error) {
      console.error('❌ استثنا در combineDateAndTime:', error);
      return null;
    }
  }


  // ========================================================================
  // لاگ خطاهای فرم (برای دیباگ)
  // ========================================================================
  private logFormErrors(): void {
    const errors: Record<string, any> = {};
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control instanceof FormArray) {
        errors[key] = control.controls.map((c, i) => ({
          index: i,
          errors: c.errors,
          value: c.value,
        }));
      } else if (control?.errors) {
        errors[key] = {
          errors: control.errors,
          value: control.value,
        };
      }
    });
    console.table(errors);
  }
}
