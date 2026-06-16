import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { BaseCrudPage } from '../../../../shared/components/crud-page/base-crud-page';
import { AppUserApiService } from '../../../../core/services/api/app-user-api.service';
import { AppUserDto } from '../../../../core/models/app-user.model';
import { USER_COLUMNS, USER_FIELDS } from '../../users.config';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [TranslatePipe, DataTableComponent, DynamicFormComponent],
  templateUrl: './user-list.component.html',
})
export class UserListComponent extends BaseCrudPage<AppUserDto, string> {
  protected api = inject(AppUserApiService);
  columns = USER_COLUMNS;
  fields = USER_FIELDS;
  formTitle = 'USER.FORM_TITLE';

  /**
   * Override: when editing and the password field is left blank,
   * don't send an empty password (writeOnly field, backend would
   * otherwise overwrite it with an empty string).
   */
  override onSave(dto: AppUserDto): void {
    if (this.selected && !dto.password) {
      delete (dto as Partial<AppUserDto>).password;
    }
    super.onSave(dto);
  }
}
