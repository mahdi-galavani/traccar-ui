import { Directive, OnInit, inject } from '@angular/core';
import { BaseApiService } from '../../../core/services/api/base-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../confirm-dialog/confirm-dialog.component';
import { CrudColumn, FieldConfig } from '../../../core/models/base/crud-field.model';

/**
 * Shared list/add/edit/delete lifecycle for every config-driven CRUD page.
 * Subclasses only provide `api`, `columns`, `fields`, and translation keys.
 */
@Directive()
export abstract class BaseCrudPage<T extends { id?: any }, ID = string> implements OnInit {
  protected abstract api: BaseApiService<T, ID>;
  abstract columns: CrudColumn[];
  abstract fields: FieldConfig[];
  abstract formTitle: string;

  protected notification = inject(NotificationService);
  protected confirmDialog = inject(ConfirmDialogService);

  items: T[] = [];
  loading = false;
  showForm = false;
  selected: T | null = null;

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.api.load().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onAdd(): void {
    this.selected = null;
    this.showForm = true;
  }

  onEdit(item: T): void {
    this.selected = item;
    this.showForm = true;
  }

  onDelete(item: T): void {
    if (item.id == null) return;

    this.confirmDialog
      .confirm({ message: 'common.confirm_delete' })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.api.delete(item.id).subscribe(() => {
          this.notification.success('common.deleted');
          this.refresh();
        });
      });
  }

  onSave(dto: T): void {
    this.api.save(dto).subscribe(() => {
      this.notification.success('common.saved');
      this.showForm = false;
      this.refresh();
    });
  }

  onCancel(): void {
    this.showForm = false;
    this.selected = null;
  }
}
