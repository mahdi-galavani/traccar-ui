import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
  imports: [TranslatePipe, DataTableComponent, DynamicFormComponent],
  templateUrl: './base-info-header-list.component.html',
})
export class BaseInfoHeaderListComponent extends BaseCrudPage<BaseInfoHeaderDto, number> {
  protected api = inject(BaseInfoHeaderApiService);
  private router = inject(Router);

  columns = BASE_INFO_HEADER_COLUMNS;
  fields = BASE_INFO_HEADER_FIELDS;
  formTitle = 'BASE_INFO_HEADER.FORM_TITLE';

  /** navigate to the items belonging to this header */
  openItems(header: BaseInfoHeaderDto): void {
    this.router.navigate(['/base-info', header.id, 'items']);
  }
}
