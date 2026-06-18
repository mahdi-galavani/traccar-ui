import { CrudColumn, FieldConfig } from '../../core/models/base/crud-field.model';

export const BASE_INFO_COLUMNS: CrudColumn[] = [
  { key: 'code', label: 'baseInfo.code' },
  { key: 'title', label: 'baseInfo.title' },
];

/**
 * `header` is not part of the visible fields: it's fixed by the
 * parent route (headerId) and injected before save, same pattern
 * as `parent` in locations.
 */
export const BASE_INFO_FIELDS: FieldConfig[] = [
  { key: 'code', label: 'baseInfo.code', type: 'text', required: true, minLength: 1 },
  { key: 'title', label: 'baseInfo.title', type: 'text', required: true, minLength: 1 },
  { key: 'description', label: 'baseInfo.description', type: 'textarea', colSpan: 2 },
];
