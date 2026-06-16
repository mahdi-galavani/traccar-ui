import { CrudColumn, FieldConfig } from '../../core/models/base/crud-field.model';

export const USER_COLUMNS: CrudColumn[] = [
  { key: 'username', label: 'user.username' },
  { key: 'enabled', label: 'user.enabled', pipe: 'boolean' },
];

export const USER_FIELDS: FieldConfig[] = [
  { key: 'username', label: 'user.username', type: 'text', required: true, minLength: 1 },
  {
    key: 'password',
    label: 'user.password',
    type: 'text',
    placeholder: 'user.password_placeholder',
    // required only enforced manually in the page for "add" mode; see component
  },
  { key: 'enabled', label: 'user.enabled', type: 'checkbox' },
];
