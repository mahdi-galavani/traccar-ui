import { inject } from '@angular/core';
import { map } from 'rxjs';
import { CrudColumn, FieldConfig } from '../../core/models/base/crud-field.model';
import { BaseInfoApiService } from '../../core/services/api/base-info-api.service';
import { BASE_INFO_HEADER_CODE } from '../../shared/constants/app.constants';

export const PERSONNEL_COLUMNS: CrudColumn[] = [
  { key: 'name', label: 'PERSONNEL.NAME' },
  { key: 'family', label: 'PERSONNEL.FAMILY' },
  { key: 'nationalCode', label: 'PERSONNEL.NATIONAL_CODE' },
  { key: 'phoneNumber', label: 'PERSONNEL.PHONE' },
  { key: 'job.title', label: 'PERSONNEL.JOB' },
];

export const PERSONNEL_FIELDS: FieldConfig[] = [
  {
    key: 'name',
    label: 'PERSONNEL.NAME',
    type: 'text',
    required: true,
    minLength: 1,
  },
  {
    key: 'family',
    label: 'PERSONNEL.FAMILY',
    type: 'text',
    required: true,
    minLength: 1,
  },
  {
    key: 'nationalCode',
    label: 'PERSONNEL.NATIONAL_CODE',
    type: 'text',
    required: true,
    minLength: 1,
  },
  {
    key: 'phoneNumber',
    label: 'PERSONNEL.PHONE',
    type: 'text',
  },
  {
    key: 'job',
    label: 'PERSONNEL.JOB',
    type: 'select',
    loadOptions: () =>
      inject(BaseInfoApiService).loadOptionsByHeaderCode(
        BASE_INFO_HEADER_CODE.CREW_JOB,
      ),
    fromDto: (dto) => dto?.job?.id ?? null,
    toDto: (id) => (id ? { id } : null),
  },
];
