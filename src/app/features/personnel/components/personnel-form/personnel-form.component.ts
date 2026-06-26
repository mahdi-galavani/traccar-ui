import { Component, EventEmitter, Input, OnChanges, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseInfoApiService } from '../../../../core/services/api/base-info-api.service';
import { SelectOption } from '../../../../core/models/base/crud-field.model';
import { AppPersonDto } from '../../../../core/models/app-person.model';
import { BASE_INFO_HEADER_CODE } from '../../../../shared/constants/app.constants';

@Component({
  selector: 'app-personnel-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './personnel-form.component.html',
  styleUrl: './personnel-form.component.css',
})
export class PersonnelFormComponent implements OnInit, OnChanges {
  @Input() model: AppPersonDto | null = null;
  @Output() saved = new EventEmitter<AppPersonDto>();
  @Output() cancelled = new EventEmitter<void>();

  private baseInfoApi = inject(BaseInfoApiService);

  readonly jobOptions = signal<SelectOption[]>([]);
  readonly aircraftTypeOptions = signal<SelectOption[]>([]);

  form = new FormGroup({
    id: new FormControl<string | null>(null),
    version: new FormControl<number | null>(null),
    name: new FormControl<string>('', [Validators.required, Validators.minLength(1)]),
    family: new FormControl<string>('', [Validators.required, Validators.minLength(1)]),
    nationalCode: new FormControl<string>('', [Validators.required, Validators.minLength(1)]),
    phoneNumber: new FormControl<string | null>(null),
    jobId: new FormControl<number | null>(null),
    aircraftTypeIds: new FormControl<number[]>([]),
  });

  ngOnInit(): void {
    this.baseInfoApi
      .loadOptionsByHeaderCode(BASE_INFO_HEADER_CODE.CREW_JOB)
      .subscribe((opts) => this.jobOptions.set(opts));

    this.baseInfoApi
      .loadOptionsByHeaderCode(BASE_INFO_HEADER_CODE.AIRPLANE_TYPE)
      .subscribe((opts) => this.aircraftTypeOptions.set(opts));
  }

  ngOnChanges(): void {
    if (this.model) {
      this.form.patchValue({
        id: this.model.id ?? null,
        version: this.model.version ?? null,
        name: this.model.name,
        family: this.model.family,
        nationalCode: this.model.nationalCode,
        phoneNumber: this.model.phoneNumber ?? null,
        jobId: this.model.job?.id ?? null,
        aircraftTypeIds: this.model.aircraftTypes?.map((t) => t.id as number) ?? [],
      });
    } else {
      this.form.reset({ aircraftTypeIds: [] });
    }
  }

  isTypeSelected(id: number): boolean {
    return (this.form.get('aircraftTypeIds')?.value ?? []).includes(id);
  }

  toggleAircraftType(id: number): void {
    const current: number[] = this.form.get('aircraftTypeIds')?.value ?? [];
    const updated = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    this.form.get('aircraftTypeIds')?.setValue(updated);
  }

  isInvalid(key: string): boolean {
    const c = this.form.get(key);
    return !!c && c.invalid && c.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const dto: AppPersonDto = {
      ...(v.id ? { id: v.id } : {}),
      ...(v.version != null ? { version: v.version } : {}),
      name: v.name!,
      family: v.family!,
      nationalCode: v.nationalCode!,
      phoneNumber: v.phoneNumber ?? undefined,
      job: v.jobId ? { id: v.jobId } : undefined,
      aircraftTypes: (v.aircraftTypeIds ?? []).map((id) => ({ id })),
    };

    this.saved.emit(dto);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
