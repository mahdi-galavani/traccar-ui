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
  FleetEventDto,
  FleetScheduleDto,
  FleetScheduleStatus,
  FleetScheduleType
} from '../../../../core/models/fleet-schedule.model';
import { FormsModule } from '@angular/forms';
import { CompleteEventModalComponent, CompleteEventResult } from '../modal/complete-event-modal.component';
import { EditLoadModalComponent } from '../modal/edit-load-modal/edit-load-modal.component';
import { FlightLoadDto } from '../modal/edit-load-modal/flight.model';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    FormsModule,
    CompleteEventModalComponent,
    EditLoadModalComponent,
  ],
  templateUrl: './schedule-list.component.html',
  styleUrl: './schedule-list.component.css',
})
export class ScheduleListComponent implements OnInit {
  private api = inject(FleetScheduleApiService);
  private router = inject(Router);
  private confirmDialog = inject(ConfirmDialogService);
  private notification = inject(NotificationService);

  readonly completeModalOpen = signal(false);
  readonly completeModalStart = signal<string | null>(null);
  readonly completeModalEnd = signal<string | null>(null);

  readonly editLoadModalOpen = signal(false);
  readonly selectedFlightId = signal<string | null>(null);

  private pendingCompleteItem: FleetScheduleDto | null = null;

  readonly items = signal<FleetScheduleDto[]>([]);
  readonly loading = signal(false);

  readonly STATUS_COLORS: Record<FleetScheduleStatus, string> = {
    SCHEDULED: 'badge-scheduled',
    COMPLETED: 'badge-completed',
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

    this.confirmDialog
      .confirm({
        message: 'common.confirm_delete',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.api.delete(item.id!).subscribe(() => {
          this.notification.success('common.deleted');
          this.load();
        });
      });
  }

  onStatusChange(item: FleetScheduleDto, newStatus: FleetScheduleStatus): void {
    if (!item.id) return;

    if (!newStatus || (newStatus as string) === 'null') {
      return;
    }

    if (newStatus === 'CANCELLED') {
      this.handleCancel(item.id);
    } else if (newStatus === 'COMPLETED') {
      this.handleComplete(item);
    } else {
      this.handleStatusUpdate(item.id, newStatus);
    }
  }

  private handleComplete(item: FleetScheduleDto): void {
    this.pendingCompleteItem = item;

    // بدون هیچ تبدیل TimeZone
    this.completeModalStart.set(
      item.plannedStartTime ? item.plannedStartTime.replace(/Z$/, '') : null,
    );

    this.completeModalEnd.set(item.plannedEndTime ? item.plannedEndTime.replace(/Z$/, '') : null);

    this.completeModalOpen.set(true);
  }

  onCompleteConfirmed(result: CompleteEventResult): void {
    const item = this.pendingCompleteItem;

    this.completeModalOpen.set(false);
    this.pendingCompleteItem = null;

    if (!item?.id) return;

    const eventDto: FleetEventDto = {
      // همان مقداری که کاربر انتخاب کرده ارسال می‌شود
      actualStartTime: result.actualStartTime,
      actualEndTime: result.actualEndTime,
    };

    this.api.setEvent(item.id, eventDto).subscribe({
      next: () => {
        this.notification.success('fleet_schedule.event_registered');
        this.load();
      },

      error: (err) => {
        console.error(err);
        this.notification.error('common.error');
      },
    });
  }

  onCompleteCancelled(): void {
    this.completeModalOpen.set(false);
    this.pendingCompleteItem = null;
  }

  private handleCancel(id: string): void {
    if (!confirm('آیا از لغو این برنامه اطمینان دارید؟')) {
      return;
    }

    this.api.cancelStatus(id).subscribe({
      next: () => {
        this.notification.success('fleet_schedule.cancelled_successfully');
        this.load();
      },

      error: (err) => {
        console.error(err);
        this.notification.error('common.error');
      },
    });
  }

  private handleStatusUpdate(id: string, status: FleetScheduleStatus): void {
    this.api.updateStatus({ id, status }).subscribe({
      next: () => {
        this.notification.success('common.saved');
        this.load();
      },

      error: (err) => {
        console.error(err);
        this.notification.error('common.error');
      },
    });
  }

  statusOptions(current: FleetScheduleStatus): FleetScheduleStatus[] {
    const all: FleetScheduleStatus[] = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];

    return all.filter((s) => s !== current);
  }

  getAirportCode(airport: any): string {
    if (airport && typeof airport === 'object' && 'code' in airport) {
      return airport.code || '???';
    }
    return '???';
  }

  getAirplaneRegister(airplane: any): string {
    if (airplane && typeof airplane === 'object' && 'register' in airplane) {
      return airplane.register || '—';
    }
    return '—';
  }

  getAirplaneModelName(airplane: any): string {
    if (airplane && typeof airplane === 'object' && 'airplaneModel' in airplane) {
      return airplane.airplaneModel?.name || '';
    }
    return '';
  }


  onEditLoad(item: FleetScheduleDto): void {
    // فقط برای پروازها مجاز است
    if (item.type !== 'FLIGHT') {
      this.notification.warning('fleet_schedule.load_edit_only_for_flights');
      return;
    }

    // بررسی وجود flight و id آن
    const flightId = item.flight?.id;
    if (!flightId) {
      this.notification.error('common.error');
      return;
    }

    this.selectedFlightId.set(flightId); // flightId از نوع string است، نه undefined
    this.editLoadModalOpen.set(true);
  }

  onLoadSaved(dto: FlightLoadDto): void {
    const id = this.selectedFlightId();
    if (!id) return;

    this.api.modifyLoad(id, dto).subscribe({
      next: () => {
        this.notification.success('fleet_schedule.load_updated');
        this.editLoadModalOpen.set(false);
        this.load(); // رفرش لیست
      },
      error: (err) => {
        console.error(err);
        let msg = 'common.error';
        if (err.status === 404) msg = 'fleet_schedule.flight_not_found';
        else if (err.status === 400) msg = 'fleet_schedule.invalid_load_data';
        this.notification.error(msg);
      },
    });
  }

  onLoadCancelled(): void {
    this.editLoadModalOpen.set(false);
    this.selectedFlightId.set(null);
  }
}
