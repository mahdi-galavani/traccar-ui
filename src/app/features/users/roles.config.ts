import { CrudColumn, FieldConfig } from '../../core/models/base/crud-field.model';

export const ROLE_COLUMNS: CrudColumn[] = [
  { key: 'code', label: 'role.code' },
  { key: 'title', label: 'role.title' },
];

export const ROLE_FIELDS: FieldConfig[] = [
  { key: 'code', label: 'role.code', type: 'text', required: true, minLength: 1 },
  { key: 'title', label: 'role.title', type: 'text', required: true, minLength: 1 },
];
