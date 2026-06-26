import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { PersonnelFormComponent } from '../../components/personnel-form/personnel-form.component';
import { AppPersonApiService } from '../../../../core/services/api/app-person-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AppPersonDto } from '../../../../core/models/app-person.model';
import { PERSONNEL_COLUMNS } from '../../personnel.config';

@Component({
  selector: 'app-personnel-list',
  standalone: true,
  imports: [TranslatePipe, DataTableComponent, PersonnelFormComponent],
  templateUrl: './personnel-list.component.html',
  styleUrl: './personnel-list.component.css',
})
export class PersonnelListComponent {
  private api = inject(AppPersonApiService);
  private notification = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogService);

  readonly columns = PERSONNEL_COLUMNS;
  readonly items = signal<AppPersonDto[]>([]);
  readonly loading = signal(false);
  readonly showForm = signal(false);
  readonly selected = signal<AppPersonDto | null>(null);

  constructor() {
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

  onEdit(item: AppPersonDto): void {
    this.selected.set(item);
    this.showForm.set(true);
  }

  onDelete(item: AppPersonDto): void {
    if (!item.id) return;
    this.confirmDialog.confirm({ message: 'COMMON.CONFIRM_DELETE' }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.delete(item.id!).subscribe(() => {
        this.notification.success('COMMON.DELETED');
        this.refresh();
      });
    });
  }

  onSave(dto: AppPersonDto): void {
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
