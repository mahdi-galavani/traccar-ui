import { inject } from '@angular/core';
import { CrudColumn, FieldConfig } from '../../core/models/base/crud-field.model';
import { BaseInfoApiService } from '../../core/services/api/base-info-api.service';
import { BASE_INFO_HEADER_CODE } from '../../shared/constants/app.constants';

export const AIRPLANE_COLUMNS: CrudColumn[] = [
  { key: 'register', label: 'AIRPLANE.REGISTER' },
  { key: 'type.title', label: 'AIRPLANE.TYPE' },
  { key: 'ownership.title', label: 'AIRPLANE.OWNERSHIP' },
  { key: 'seatStyle.title', label: 'AIRPLANE.SEAT_STYLE' },
];

export const AIRPLANE_FIELDS: FieldConfig[] = [
  { key: 'register', label: 'AIRPLANE.REGISTER', type: 'text', required: true },
  {
    key: 'type',
    label: 'AIRPLANE.TYPE',
    type: 'select',
    required: true,
    loadOptions: () => inject(BaseInfoApiService).loadOptionsByHeaderCode(BASE_INFO_HEADER_CODE.AIRPLANE_TYPE),
    fromDto: (dto) => dto?.type?.id ?? null,
    toDto: (id) => (id ? { id } : null),
  },
  {
    key: 'ownership',
    label: 'AIRPLANE.OWNERSHIP',
    type: 'select',
    required: true,
    loadOptions: () => inject(BaseInfoApiService).loadOptionsByHeaderCode(BASE_INFO_HEADER_CODE.AIRPLANE_OWNERSHIP),
    fromDto: (dto) => dto?.ownership?.id ?? null,
    toDto: (id) => (id ? { id } : null),
  },
  {
    key: 'seatStyle',
    label: 'AIRPLANE.SEAT_STYLE',
    type: 'select',
    required: true,
    loadOptions: () => inject(BaseInfoApiService).loadOptionsByHeaderCode(BASE_INFO_HEADER_CODE.SEAT_STYLE),
    fromDto: (dto) => dto?.seatStyle?.id ?? null,
    toDto: (id) => (id ? { id } : null),
  },
];
