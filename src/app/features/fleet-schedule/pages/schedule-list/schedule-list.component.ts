import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FleetScheduleApiService } from '../../../../core/services/api/fleet-schedule-api.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import {
  FleetScheduleDto,
  FleetScheduleStatus,
  FleetScheduleType,
} from '../../../../core/models/fleet-schedule.model';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './schedule-list.component.html',
  styleUrl: './schedule-list.component.css',
})
export class ScheduleListComponent implements OnInit {
  private api = inject(FleetScheduleApiService);
  private router = inject(Router);
  private confirmDialog = inject(ConfirmDialogService);
  private notification = inject(NotificationService);

  readonly items = signal<FleetScheduleDto[]>([]);
  readonly loading = signal(false);

  readonly STATUS_COLORS: Record<FleetScheduleStatus, string> = {
    DRAFT: 'badge-draft',
    SCHEDULED: 'badge-scheduled',
    CANCELLED: 'badge-cancelled',
  };

  readonly TYPE_ICONS: Record<FleetScheduleType, string> = {
    FLIGHT: '✈️',
    CHECK: '🔧',
    DFDR: '📋',
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
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
    this.router.navigate(['/fleet-schedule/new']);
  }

  onEdit(item: FleetScheduleDto): void {
    this.router.navigate(['/fleet-schedule/edit', item.id]);
  }

  onDelete(item: FleetScheduleDto): void {
    if (!item.id) return;
    this.confirmDialog.confirm({ message: 'common.confirm_delete' }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.delete(item.id!).subscribe(() => {
        this.notification.success('common.deleted');
        this.load();
      });
    });
  }

  onStatusChange(item: FleetScheduleDto, status: FleetScheduleStatus): void {
    if (!item.id) return;
    this.api.updateStatus({ id: item.id, status }).subscribe(() => {
      this.notification.success('common.saved');
      this.load();
    });
  }

  statusOptions(current: FleetScheduleStatus): FleetScheduleStatus[] {
    const all: FleetScheduleStatus[] = ['DRAFT', 'SCHEDULED', 'CANCELLED'];
    return all.filter((s) => s !== current);
  }
}
