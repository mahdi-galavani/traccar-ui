import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { BaseInfoApiService } from '../../../../core/services/api/base-info-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BaseInfoDto } from '../../../../core/models/base-info.model';
import { BASE_INFO_COLUMNS, BASE_INFO_FIELDS } from '../../base-info.config';

@Component({
  selector: 'app-base-info-list',
  standalone: true,
  imports: [TranslatePipe, DataTableComponent, DynamicFormComponent],
  templateUrl: './base-info-list.component.html',
})
export class BaseInfoListComponent implements OnInit {
  private api = inject(BaseInfoApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogService);

  columns = BASE_INFO_COLUMNS;
  fields = BASE_INFO_FIELDS;

  private headerId!: number;
  items: BaseInfoDto[] = [];
  loading = false;
  showForm = false;
  selected: BaseInfoDto | null = null;

  ngOnInit(): void {
    this.headerId = Number(this.route.snapshot.paramMap.get('headerId'));
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.api.load().subscribe({
      next: (all) => {
        this.items = all.filter((item) => item.header?.id === this.headerId);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onAdd(): void {
    this.selected = { header: { id: this.headerId } } as BaseInfoDto;
    this.showForm = true;
  }

  onEdit(item: BaseInfoDto): void {
    this.selected = item;
    this.showForm = true;
  }

  onDelete(item: BaseInfoDto): void {
    if (item.id == null) return;
    this.confirmDialog.confirm({ message: 'common.confirm_delete' }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.delete(item.id!).subscribe(() => {
        this.notification.success('common.deleted');
        this.refresh();
      });
    });
  }

  onSave(dto: BaseInfoDto): void {
    dto.header = { id: this.headerId };
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

  goBack(): void {
    this.router.navigate(['/base-info']);
  }
}
