import { inject } from '@angular/core';
import { CrudColumn, FieldConfig, SelectOption } from '../../core/models/base/crud-field.model';
import { LocationApiService } from '../../core/services/api/location-api.service';
import { map } from 'rxjs';

export const AIRPORT_COLUMNS: CrudColumn[] = [
  { key: 'code', label: 'AIRPORT.CODE' },
  { key: 'location.title', label: 'AIRPORT.LOCATION' },
];

function loadLocationOptions(): import('rxjs').Observable<SelectOption[]> {
  return inject(LocationApiService).load().pipe(
    map((locations) => locations.map((l) => ({ label: l.title, value: l.id }))),
  );
}

export const AIRPORT_FIELDS: FieldConfig[] = [
  { key: 'code', label: 'AIRPORT.CODE', type: 'text', required: true },
  {
    key: 'location',
    label: 'AIRPORT.LOCATION',
    type: 'select',
    required: true,
    loadOptions: loadLocationOptions,
    fromDto: (dto) => dto?.location?.id ?? null,
    toDto: (id) => (id ? { id } : null),
  },
];
