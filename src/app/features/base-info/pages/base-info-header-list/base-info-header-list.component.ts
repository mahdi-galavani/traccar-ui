// base-info-header-list.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { BaseCrudPage } from '../../../../shared/components/crud-page/base-crud-page';
import { BaseInfoHeaderApiService } from '../../../../core/services/api/base-info-header-api.service';
import { BaseInfoHeaderDto } from '../../../../core/models/base-info-header.model';
import { BASE_INFO_HEADER_COLUMNS, BASE_INFO_HEADER_FIELDS } from '../../base-info-header.config';

@Component({
  selector: 'app-base-info-header-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe, DataTableComponent, DynamicFormComponent],
  templateUrl: './base-info-header-list.component.html',
  styleUrls: ['./base-info-header-list.component.css'],
})
export class BaseInfoHeaderListComponent extends BaseCrudPage<BaseInfoHeaderDto, number> {
  protected api = inject(BaseInfoHeaderApiService);
  private router = inject(Router);

  readonly searchQuery = signal('');
  // وضعیت نمایش: کارتی یا جدولی
  readonly viewMode = signal<'grid' | 'table'>('grid');

  readonly filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.items();
    return this.items().filter(
      (item) =>
        item.code?.toLowerCase().includes(query) ||
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query),
    );
  });

  columns = BASE_INFO_HEADER_COLUMNS;
  fields = BASE_INFO_HEADER_FIELDS;
  formTitle = 'baseInfoHeader.formTitle';

  readonly stats = computed(() => ({
    total: this.items().length,
  }));

  override onAdd(): void {
    this.selected.set({} as BaseInfoHeaderDto);
    this.showForm.set(true);
  }

  async openItems(header: BaseInfoHeaderDto): Promise<void> {
    await this.router.navigate(['/base-info', header.id, 'items'], {
      state: { headerTitle: header.title },
    });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  toggleViewMode(mode: 'grid' | 'table'): void {
    this.viewMode.set(mode);
  }

  exportData(): void {
    const data = this.filteredItems().map((item) => ({
      کد: item.code,
      عنوان: item.title,
      توضیحات: item.description || '-',
    }));
    console.log('Export data:', data);
    this.notification.success('BASE_INFO_HEADER.EXPORT_SUCCESS');
  }
}
