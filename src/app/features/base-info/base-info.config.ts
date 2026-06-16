import { CrudColumn, FieldConfig } from '../../core/models/base/crud-field.model';

export const BASE_INFO_COLUMNS: CrudColumn[] = [
  { key: 'code', label: 'BASE_INFO.CODE' },
  { key: 'title', label: 'BASE_INFO.TITLE' },
];

/**
 * `header` is not part of the visible fields: it's fixed by the
 * parent route (headerId) and injected before save, same pattern
 * as `parent` in locations.
 */
export const BASE_INFO_FIELDS: FieldConfig[] = [
  { key: 'code', label: 'BASE_INFO.CODE', type: 'text', required: true, minLength: 1 },
  { key: 'title', label: 'BASE_INFO.TITLE', type: 'text', required: true, minLength: 1 },
  { key: 'description', label: 'BASE_INFO.DESCRIPTION', type: 'textarea', colSpan: 2 },
];
