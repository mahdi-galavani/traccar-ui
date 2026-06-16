import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { BaseCrudPage } from '../../../../shared/components/crud-page/base-crud-page';
import { AppRoleApiService } from '../../../../core/services/api/app-role-api.service';
import { AppRoleDto } from '../../../../core/models/app-role.model';
import { ROLE_COLUMNS, ROLE_FIELDS } from '../../roles.config';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [TranslatePipe, DataTableComponent, DynamicFormComponent],
  templateUrl: './role-list.component.html',
})
export class RoleListComponent extends BaseCrudPage<AppRoleDto, string> {
  protected api = inject(AppRoleApiService);
  columns = ROLE_COLUMNS;
  fields = ROLE_FIELDS;
  formTitle = 'ROLE.FORM_TITLE';
}
