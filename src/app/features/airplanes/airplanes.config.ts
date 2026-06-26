import { CrudColumn, FieldConfig } from '../../core/models/base/crud-field.model';
import { BaseInfoApiService } from '../../core/services/api/base-info-api.service';
import { BASE_INFO_HEADER_CODE } from '../../shared/constants/app.constants';

export const AIRPLANE_COLUMNS: CrudColumn[] = [
  { key: 'register', label: 'airplane.register' },
  { key: 'type.title', label: 'airplane.type' },
  { key: 'ownership.title', label: 'airplane.ownership' },
  { key: 'seatStyle.title', label: 'airplane.seat_style' },
  { key: 'firstClassSeat', label: 'airplane.first_class_seat' },
  { key: 'businessClassSeat', label: 'airplane.business_class_seat' },
  { key: 'economicClassSeat', label: 'airplane.economic_class_seat' },
  { key: 'payload', label: 'airplane.payload' },
];

export const getAirplaneFields = (baseInfoApi: BaseInfoApiService): FieldConfig[] => [
  {
    key: 'register',
    label: 'airplane.register',
    type: 'text',
    required: true
  },
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
  {
    key: 'firstClassSeat',
    label: 'airplane.first_class_seat',
    type: 'number',
    required: false
  },
  {
    key: 'businessClassSeat',
    label: 'airplane.business_class_seat',
    type: 'number',
    required: false
  },
  {
    key: 'economicClassSeat',
    label: 'airplane.economic_class_seat',
    type: 'number',
    required: false
  },
  {
    key: 'payload',
    label: 'airplane.payload',
    type: 'number',
    required: false
  },
];
