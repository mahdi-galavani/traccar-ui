import { Observable } from 'rxjs';

/**
 * Generic field/column definitions consumed by DynamicFormComponent
 * and DataTableComponent (used by every CRUD feature).
 */
export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'checkbox'
  | 'date'
  | 'select';

export interface SelectOption {
  label: string;
  value: unknown;
}

export interface FieldConfig {
  /** form control name */
  key: string;
  /** translation key shown as label */
  label: string;
  type: FieldType;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  /** static options, for type === 'select' */
  options?: SelectOption[];
  /** dynamic options loaded from an API, for type === 'select' */
  loadOptions?: () => Observable<SelectOption[]>;
  /** maps a DTO -> initial form value (for nested relations) */
  fromDto?: (dto: any) => unknown;
  /** maps a form value -> DTO shape before save (for nested relations) */
  toDto?: (value: unknown) => unknown;
  /** layout hint for 2-column form grids */
  colSpan?: 1 | 2;
}

export interface CrudColumn {
  /** can be nested, e.g. 'type.title' */
  key: string;
  label: string;
  pipe?: 'date' | 'jalaliDate' | 'boolean';
  width?: string;
}
