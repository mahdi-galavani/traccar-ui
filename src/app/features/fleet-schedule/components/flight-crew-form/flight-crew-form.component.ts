import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AppPersonApiService } from '../../../../core/services/api/app-person-api.service';
import { BaseInfoApiService } from '../../../../core/services/api/base-info-api.service';
import { SelectOption } from '../../../../core/models/base/crud-field.model';
import { BASE_INFO_HEADER_CODE } from '../../../../shared/constants/app.constants';

@Component({
  selector: 'app-flight-crew-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './flight-crew-form.component.html',
  styleUrl: './flight-crew-form.component.css',
})
export class FlightCrewFormComponent implements OnInit {
  /** the FormArray از فرم والد */
  @Input() crewArray!: FormArray;

  private personApi = inject(AppPersonApiService);
  private baseInfoApi = inject(BaseInfoApiService);

  readonly personOptions = signal<SelectOption[]>([]);
  readonly crewJobOptions = signal<SelectOption[]>([]);

  get rows(): FormGroup[] {
    return this.crewArray.controls as FormGroup[];
  }

  ngOnInit(): void {
    this.personApi.load().subscribe((persons) => {
      this.personOptions.set(
        persons.map((p) => ({
          label: `${p.name} ${p.family}`,
          value: p.id,
        })),
      );
    });

    this.baseInfoApi
      .loadOptionsByHeaderCode(BASE_INFO_HEADER_CODE.CREW_JOB)
      .subscribe((opts) => this.crewJobOptions.set(opts));
  }

  addRow(): void {
    this.crewArray.push(this.buildRow());
  }

  removeRow(index: number): void {
    if (this.crewArray.length > 1) {
      this.crewArray.removeAt(index);
    }
  }

  buildRow(personId: string | null = null, crewJobId: number | null = null): FormGroup {
    return new FormGroup({
      personId: new FormControl(personId, Validators.required),
      crewJobId: new FormControl(crewJobId, Validators.required),
    });
  }
}
