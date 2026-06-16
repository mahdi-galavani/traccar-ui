import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { CrudColumn } from '../../../core/models/base/crud-field.model';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent<T extends Record<string, any> = Record<string, any>> {
  @Input() columns: CrudColumn[] = [];
  @Input() items: T[] = [];
  @Input() loading = false;
  @Input() addLabel = 'common.add';
  @Input() canAdd = true;
  @Input() canEdit = true;
  @Input() canDelete = true;

  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();

  /** resolves nested keys like 'type.title' */
  resolve(item: T, key: string): unknown {
    return key.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, item);
  }

  /** narrows an unknown value to a type the `date` pipe accepts */
  resolveDate(item: T, key: string): string | number | Date | null | undefined {
    const value = this.resolve(item, key);
    if (value == null || typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
      return value;
    }
    return null;
  }
}
