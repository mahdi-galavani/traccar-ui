import { Component, ViewChild, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LocationTreeComponent } from '../../components/location-tree/location-tree.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { LocationApiService } from '../../../../core/services/api/location-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LocationDto } from '../../../../core/models/location.model';
import { LOCATION_FIELDS } from '../../locations.config';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [TranslatePipe, LocationTreeComponent, DynamicFormComponent],
  templateUrl: './location-list.component.html',
  styleUrl: './location-list.component.css',
})
export class LocationListComponent {
  // دسترسی به روت اصلی درخت برای بازخوانی اطلاعات
  @ViewChild(LocationTreeComponent) tree?: LocationTreeComponent;

  private api = inject(LocationApiService);
  private notification = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogService);

  readonly fields = LOCATION_FIELDS;
  readonly showForm = signal(false);
  readonly formModel = signal<Partial<LocationDto> | null>(null);

  /**
   * افزودن فرزند جدید به نود انتخاب شده
   * @param parent نود پدر (اگر null باشد یعنی اضافه کردن در سطح ریشه/قاره)
   */
  onAddChild(parent: LocationDto | null): void {
    const parentRef = parent?.id ? { id: parent.id } : null;

    // تعیین اتوماتیک تایپ لوکیشن فرزند برای راحتی بیشتر کاربر
    let defaultType: 'CONTINENT' | 'COUNTRY' | 'PROVINCE' = 'CONTINENT';
    if (parent?.type === 'CONTINENT') defaultType = 'COUNTRY';
    if (parent?.type === 'COUNTRY') defaultType = 'PROVINCE';

    this.formModel.set({
      parent: parentRef,
      type: defaultType,
      enabled: true // پیش‌فرض فعال
    } as Partial<LocationDto>);

    this.showForm.set(true);
  }

  /**
   * ویرایش نود انتخاب شده
   */
  onEdit(item: LocationDto): void {
    this.formModel.set({ ...item });
    this.showForm.set(true);
  }

  /**
   * حذف لوکیشن
   */
  onDelete(item: LocationDto): void {
    if (item.id == null) return;

    this.confirmDialog.confirm({ message: 'common.confirm_delete' }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.delete(item.id!).subscribe({
        next: () => {
          this.notification.success('common.dataDeleted');
          this.reloadTree();
        }
      });
    });
  }

  /**
   * ذخیره فرم ایجاد یا ویرایش
   */
  onSave(dto: LocationDto): void {
    this.api.save(dto).subscribe({
      next: () => {
        this.notification.success('common.dataSaved');
        this.showForm.set(false);
        this.formModel.set(null);
        this.reloadTree();
      }
    });
  }

  /**
   * لغو عملیات فرم
   */
  onCancel(): void {
    this.showForm.set(false);
    this.formModel.set(null);
  }

  /**
   * بازخوانی اطلاعات نودهای ریشه درخت لوکیشن پس از انجام هر عملیات (CRUD)
   */
  private reloadTree(): void {
    if (this.tree) {
      this.tree.loadChildren();
    }
  }
}
