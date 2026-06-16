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

/**
 * Fields for the "add child" form. The `parent` value is injected
 * by the tree component before opening the form (see location-tree),
 * so it's not part of the visible field list.
 */
export const LOCATION_FIELDS: FieldConfig[] = [
  { key: 'code', label: 'location.code', type: 'text', required: true, minLength: 1 },
  { key: 'title', label: 'location.title', type: 'text', required: true, minLength: 1 },
  {
    key: 'type',
    label: 'location.type',
    type: 'select',
    required: true,
    options: LOCATION_TYPE_OPTIONS,
  },
  { key: 'enabled', label: 'LOCATION.ENABLED', type: 'checkbox' },
];
