import { CrudColumn, FieldConfig } from '../../core/models/base/crud-field.model';
import { BaseInfoApiService } from '../../core/services/api/base-info-api.service';
import { BASE_INFO_HEADER_CODE } from '../../shared/constants/app.constants';

export const AIRPLANE_COLUMNS: CrudColumn[] = [
  { key: 'register', label: 'airplane.register' },
  { key: 'type.title', label: 'airplane.type' },
  { key: 'ownership.title', label: 'airplane.ownership' },
  { key: 'seatStyle.title', label: 'airplane.seat_style' },
];

// تبدیل به یک تابع که سرویس اطلاعات پایه را به عنوان ورودی دریافت می‌کند
export const getAirplaneFields = (baseInfoApi: BaseInfoApiService): FieldConfig[] => [
  { key: 'register', label: 'airplane.register', type: 'text', required: true },
  {
    key: 'type',
    label: 'airplane.type',
    type: 'select',
    required: true,
    loadOptions: () => baseInfoApi.loadOptionsByHeaderCode(BASE_INFO_HEADER_CODE.AIRPLANE_TYPE),
    fromDto: (dto) => dto?.type?.id ?? null,
    toDto: (id) => (id ? { id } : null),
  },
  {
    key: 'ownership',
    label: 'airplane.ownership',
    type: 'select',
    required: true,
    loadOptions: () => baseInfoApi.loadOptionsByHeaderCode(BASE_INFO_HEADER_CODE.AIRPLANE_OWNERSHIP),
    fromDto: (dto) => dto?.ownership?.id ?? null,
    toDto: (id) => (id ? { id } : null),
  },
  {
    key: 'seatStyle',
    label: 'airplane.seat_style',
    type: 'select',
    required: true,
    loadOptions: () => baseInfoApi.loadOptionsByHeaderCode(BASE_INFO_HEADER_CODE.SEAT_STYLE),
    fromDto: (dto) => dto?.seatStyle?.id ?? null,
    toDto: (id) => (id ? { id } : null),
  },
];
