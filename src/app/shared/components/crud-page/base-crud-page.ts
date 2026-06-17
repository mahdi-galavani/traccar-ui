import { Directive, OnInit, inject, signal } from '@angular/core';
import { BaseApiService } from '../../../core/services/api/base-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../confirm-dialog/confirm-dialog.component';
import { CrudColumn, FieldConfig } from '../../../core/models/base/crud-field.model';

@Directive()
export abstract class BaseCrudPage<T extends { id?: any }, ID = string> implements OnInit {
  protected abstract api: BaseApiService<T, ID>;
  abstract columns: CrudColumn[];
  abstract fields: FieldConfig[];
  abstract formTitle: string;

  protected notification = inject(NotificationService);
  protected confirmDialog = inject(ConfirmDialogService);

  readonly items = signal<T[]>([]);
  readonly loading = signal(false);
  readonly showForm = signal(false);
  readonly selected = signal<T | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.api.load().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onAdd(): void {
    this.selected.set(null);
    this.showForm.set(true);
  }

  onEdit(item: T): void {
    this.selected.set(item);
    this.showForm.set(true);
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
      this.showForm.set(false);
      this.refresh();
    });
  }

  onCancel(): void {
    this.showForm.set(false);
    this.selected.set(null);
  }
}
