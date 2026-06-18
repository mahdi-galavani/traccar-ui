import { CrudColumn, FieldConfig } from '../../core/models/base/crud-field.model';

export const BASE_INFO_HEADER_COLUMNS: CrudColumn[] = [
  { key: 'code', label: 'baseInfoHeader.code' },
  { key: 'title', label: 'baseInfoHeader.title' },
  { key: 'actions-items', label: 'baseInfoHeader.viewItems' }
];

export const BASE_INFO_HEADER_FIELDS: FieldConfig[] = [
  { key: 'code', label: 'baseInfoHeader.code', type: 'text', required: true, minLength: 1 },
  { key: 'title', label: 'baseInfoHeader.title', type: 'text', required: true, minLength: 1 },
  { key: 'description', label: 'baseInfoHeader.description', type: 'textarea', colSpan: 2 },
];
