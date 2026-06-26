import { CrudColumn, FieldConfig, SelectOption } from '../../core/models/base/crud-field.model';
import { LocationApiService } from '../../core/services/api/location-api.service';
import { map, Observable } from 'rxjs';

export const AIRPORT_COLUMNS: CrudColumn[] = [
  { key: 'code', label: 'airport.code' },
  { key: 'name', label: 'airport.name' },
  { key: 'location.title', label: 'airport.location' },
  { key: 'internal', label: 'airport.internal' },
];

function loadLocationOptions(locationApi: LocationApiService): Observable<SelectOption[]> {
  return locationApi.load().pipe(
    map((locations) => locations.map((l) => ({
      label: l.title,
      value: l.id
    }))),
  );
}

export const getAirportFields = (locationApi: LocationApiService): FieldConfig[] => [
  {
    key: 'code',
    label: 'airport.code',
    type: 'text',
    required: true
  },
  {
    key: 'name',
    label: 'airport.name',
    type: 'text',
    required: true
  },
  {
    key: 'location',
    label: 'airport.location',
    type: 'select',
    required: true,
    loadOptions: () => loadLocationOptions(locationApi),

    fromDto: (dto) => {
      if (!dto || !dto.location) return null;
      return typeof dto.location === 'object' ? dto.location.id : dto.location;
    },

    toDto: (value: any) => {
      if (!value) return null;
      if (typeof value === 'object' && value.id) {
        return { id: value.id, title: value.title || '', code: value.code || '' };
      }
      return { id: Number(value), title: '', code: '' };
    },
  },
  {
    key: 'internal',
    label: 'airport.internal',
    type: 'checkbox',
    required: false
  },
];
