import { CrudColumn, FieldConfig } from '../../core/models/base/crud-field.model';

export const BASE_INFO_HEADER_COLUMNS: CrudColumn[] = [
  { key: 'code', label: 'BASE_INFO_HEADER.CODE' },
  { key: 'title', label: 'BASE_INFO_HEADER.TITLE' },
];

export const BASE_INFO_HEADER_FIELDS: FieldConfig[] = [
  { key: 'code', label: 'BASE_INFO_HEADER.CODE', type: 'text', required: true, minLength: 1 },
  { key: 'title', label: 'BASE_INFO_HEADER.TITLE', type: 'text', required: true, minLength: 1 },
  { key: 'description', label: 'BASE_INFO_HEADER.DESCRIPTION', type: 'textarea', colSpan: 2 },
];
