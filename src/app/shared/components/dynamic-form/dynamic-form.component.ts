import { Component, EventEmitter, Input, OnChanges, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { FieldConfig, SelectOption } from '../../../core/models/base/crud-field.model';
import { take } from 'rxjs';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css',
})
export class DynamicFormComponent<T extends Record<string, any> = Record<string, any>>
  implements OnInit, OnChanges
{
  @Input() fields: FieldConfig[] = [];
  @Input() model: Partial<T> | null = null;
  @Input() title = '';
  @Output() saved = new EventEmitter<T>();
  @Output() cancelled = new EventEmitter<void>();

  form = new FormGroup<Record<string, FormControl>>({});
  readonly optionsByKey = signal<Record<string, SelectOption[]>>({});

  ngOnInit(): void {
    this.loadDynamicOptions();
  }

  ngOnChanges(): void {
    this.buildForm();
  }

  private buildForm(): void {
    const group: Record<string, FormControl> = {};

    for (const field of this.fields) {
      const validators: ValidatorFn[] = [];
      if (field.required) validators.push(Validators.required);
      if (field.minLength) validators.push(Validators.minLength(field.minLength));

      const initialValue = field.fromDto
        ? field.fromDto(this.model ?? {})
        : ((this.model as Record<string, unknown> | null)?.[field.key] ?? null);

      group[field.key] = new FormControl(initialValue, validators);
    }

    this.form = new FormGroup(group);
  }

  private loadDynamicOptions(): void {
    for (const field of this.fields) {
      if (field.type === 'select' && field.loadOptions) {
        field.loadOptions()
          .pipe(take(1)) // <--- اضافه کنید تا پس از یک‌بار دریافت دیتا، درخواست فوراً بسته شود
          .subscribe((options) => {
            this.optionsByKey.update((map) => ({ ...map, [field.key]: options }));
          });
      }
    }
  }

  optionsFor(field: FieldConfig): SelectOption[] {
    return field.options ?? this.optionsByKey()[field.key] ?? [];
  }

  isInvalid(key: string): boolean {
    const control = this.form.get(key);
    return !!control && control.invalid && control.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const result: Record<string, unknown> = { ...(this.model ?? {}) };

    for (const field of this.fields) {
      result[field.key] = field.toDto ? field.toDto(raw[field.key]) : raw[field.key];
    }

    this.saved.emit(result as T);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
