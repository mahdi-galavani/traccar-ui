import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { BaseCrudPage } from '../../../../shared/components/crud-page/base-crud-page';
import { AppUserApiService } from '../../../../core/services/api/app-user-api.service';
import { AppUserDto } from '../../../../core/models/app-user.model';
import { USER_COLUMNS, USER_FIELDS } from '../../users.config';
import { Observable, of, map } from 'rxjs';
import { FieldConfig, SelectOption } from '../../../../core/models/base/crud-field.model';
import { AppRoleApiService } from '../../../../core/services/api/app-role-api.service';
import { AppUserRoleApiService } from '../../../../core/services/api/app-user-role-api.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [TranslatePipe, DataTableComponent, DynamicFormComponent],
  templateUrl: './user-list.component.html',
})
export class UserListComponent extends BaseCrudPage<AppUserDto, string> {
  protected api = inject(AppUserApiService);
  protected roleApi = inject(AppRoleApiService);
  protected userRoleApi = inject(AppUserRoleApiService);

  columns = USER_COLUMNS;
  fields = USER_FIELDS;
  formTitle = 'user.form_title'; // اصلاح به حروف کوچک

  readonly selectedRoleModel = signal<{ roleId: string }>({
    roleId: '',
  });
  readonly showActionForm = signal(false);

  override onSave(dto: AppUserDto): void {
    if (this.selected() && !dto.password) {
      delete (dto as Partial<AppUserDto>).password;
    }
    super.onSave(dto);
  }

  /// action rol func
  getAction(item: AppUserDto): void {
    this.selected.set(item);

    this.selectedRoleModel.set({
      roleId: '',
    });

    this.showActionForm.set(true);
  }

  roleFields: FieldConfig[] = [
    {
      key: 'roleId',
      label: 'role.title',
      type: 'select',
      required: true,
      loadOptions: () => this.loadRoleOptions(),
    },
  ];

  loadRoleOptions(): Observable<SelectOption[]> {
    return this.roleApi.load().pipe(
      map(
        (res) =>
          res?.map((role) => ({
            label: `${role.code} - ${role.title}`,
            value: role.id,
          })) ?? [],
      ),
    );
  }

  // post rol request
  onSaveRol(formValue: { roleId: string }): void {
    const roleId = formValue.roleId;
    this.userRoleApi.loadByUser(roleId).subscribe((data) => {
      this.roleApi.load().subscribe((roles) => {
        const role = roles.find((res) => res.id === formValue.roleId);

        if (!role) return;

        this.userRoleApi
          .save({
            id: data.id,
            version: data.version,
            roles: [role],
          })
          .subscribe(() => {
            this.notification.success('common.saved');
            this.showActionForm.set(false);
          });
      });
    });
  }

  onCancelRole(): void {
    this.showActionForm.set(false);
    this.selectedRoleModel.set({
      roleId: '',
    });
  }
}
