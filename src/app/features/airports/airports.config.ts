import { CrudColumn, FieldConfig, SelectOption } from '../../core/models/base/crud-field.model';
import { LocationApiService } from '../../core/services/api/location-api.service';
import { map, Observable } from 'rxjs';

export const AIRPORT_COLUMNS: CrudColumn[] = [
  { key: 'code', label: 'airport.code' },
  { key: 'location.title', label: 'airport.location' },
];

// تغییر متد به طوری که سرویس را به عنوان ورودی دریافت کند
function loadLocationOptions(locationApi: LocationApiService): Observable<SelectOption[]> {
  return locationApi.load().pipe(
    map((locations) => locations.map((l) => ({
      label: l.title,
      value: l.id
    }))),
  );
}

// تبدیل فیلدها به یک تابع که سرویس لوکیشن را می‌گیرد
export const getAirportFields = (locationApi: LocationApiService): FieldConfig[] => [
  { key: 'code', label: 'airport.code', type: 'text', required: true },
  {
    key: 'location',
    label: 'airport.location',
    type: 'select',
    required: true,
    // ایجاد یک کلclosure برای صدا زدن متد با سرویس تزریق شده
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
];
