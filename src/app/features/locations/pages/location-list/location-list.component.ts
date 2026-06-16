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
  @ViewChild(LocationTreeComponent) tree?: LocationTreeComponent;

  private api = inject(LocationApiService);
  private notification = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogService);

  readonly fields = LOCATION_FIELDS;
  readonly showForm = signal(false);
  readonly formModel = signal<Partial<LocationDto> | null>(null);

  onAddChild(parent: LocationDto | null): void {
    const parentRef = parent?.id ? { id: parent.id } : null;
    this.formModel.set({ parent: parentRef } as Partial<LocationDto>);
    this.showForm.set(true);
  }

  onEdit(item: LocationDto): void {
    this.formModel.set(item);
    this.showForm.set(true);
  }

  onDelete(item: LocationDto): void {
    if (item.id == null) return;

    this.confirmDialog.confirm({ message: 'common.confirm_delete' }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.delete(item.id!).subscribe(() => {
        this.notification.success('common.deleted');
        this.reloadTree();
      });
    });
  }

  onSave(dto: LocationDto): void {
    this.api.save(dto).subscribe(() => {
      this.notification.success('common.saved');
      this.showForm.set(false);
      this.reloadTree();
    });
  }

  onCancel(): void {
    this.showForm.set(false);
    this.formModel.set(null);
  }

  private reloadTree(): void {
    this.tree?.refresh();
  }
}
