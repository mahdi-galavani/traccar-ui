import { CrudColumn, FieldConfig } from '../../core/models/base/crud-field.model';

export const ROLE_COLUMNS: CrudColumn[] = [
  { key: 'code', label: 'ROLE.CODE' },
  { key: 'title', label: 'ROLE.TITLE' },
];

export const ROLE_FIELDS: FieldConfig[] = [
  { key: 'code', label: 'ROLE.CODE', type: 'text', required: true, minLength: 1 },
  { key: 'title', label: 'ROLE.TITLE', type: 'text', required: true, minLength: 1 },
];
