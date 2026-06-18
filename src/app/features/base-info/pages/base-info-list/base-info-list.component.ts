// base-info-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, TranslatePipe, DataTableComponent, DynamicFormComponent],
  templateUrl: './base-info-list.component.html',
  styleUrls: ['./base-info-list.component.css']
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
  readonly headerTitle = signal<string>('');

  // تعریف استیت‌ها با استفاده از Signals
  readonly items = signal<BaseInfoDto[]>([]);
  readonly loading = signal<boolean>(false);
  readonly showForm = signal<boolean>(false);
  readonly selected = signal<BaseInfoDto | null>(null);
  readonly searchQuery = signal<string>('');

  // مپ کردن دیتای فیلتر شده به جدول به صورت کاملاً Reactive (حل مشکل جستجوی قبلی)
  readonly filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const currentItems = this.items();
    if (!query) return currentItems;

    return currentItems.filter(item =>
      item.code?.toLowerCase().includes(query) ||
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.headerId = Number(this.route.snapshot.paramMap.get('headerId'));
    // دریافت نام هدر از تاریخچه ناوبری
    this.headerTitle.set(history.state?.headerTitle || '');
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.api.load().subscribe({
      next: (all) => {
        const filtered = all.filter((item) => item.header?.id === this.headerId);
        this.items.set(filtered);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onAdd(): void {
    this.selected.set({ header: { id: this.headerId } } as BaseInfoDto);
    this.showForm.set(true);
  }

  onEdit(item: BaseInfoDto): void {
    this.selected.set(item);
    this.showForm.set(true);
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
      this.showForm.set(false);
      this.refresh();
    });
  }

  onCancel(): void {
    this.showForm.set(false);
    this.selected.set(null);
  }

  goBack(): void {
    this.router.navigate(['/base-info']);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }
}
