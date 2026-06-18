import { CrudColumn, FieldConfig, SelectOption } from '../../core/models/base/crud-field.model';

export const LOCATION_COLUMNS: CrudColumn[] = [
  { key: 'code', label: 'location.code' },
  { key: 'title', label: 'location.title' },
  { key: 'type', label: 'location.type' },
  { key: 'enabled', label: 'location.enabled', pipe: 'boolean' },
];

export const LOCATION_TYPE_OPTIONS: SelectOption[] = [
  { label: 'location.types.continent', value: 'CONTINENT' },
  { label: 'location.types.country', value: 'COUNTRY' },
  { label: 'location.types.province', value: 'PROVINCE' },
];

export const LOCATION_FIELDS: FieldConfig[] = [
  {
    key: 'code',
    label: 'location.code',
    type: 'text',
    required: true,
    minLength: 1,
    placeholder: 'مثال: IR یا Asia'
  },
  {
    key: 'title',
    label: 'location.title',
    type: 'text',
    required: true,
    minLength: 1,
    placeholder: 'عنوان موقعیت را وارد کنید'
  },
  {
    key: 'type',
    label: 'location.type',
    type: 'select',
    required: true,
    options: LOCATION_TYPE_OPTIONS,
  },
  {
    key: 'enabled',
    label: 'location.enabled',
    type: 'checkbox'
  },
  {
    key: 'description',
    label: 'common.description',
    type: 'textarea',
    colSpan: 2,
    placeholder: 'توضیحات تکمیلی درباره این موقعیت جغرافیایی...'
  },
];
