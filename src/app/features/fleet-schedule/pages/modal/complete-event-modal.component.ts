import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

// پکیج‌های رسمی انگولار متریال ۲۲
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import moment from 'moment-jalaali';

export interface CompleteEventResult {
  actualStartTime: string;
  actualEndTime: string;
}

@Component({
  selector: 'app-complete-event-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule
  ],
  providers: [provideNativeDateAdapter()], // آداپتور تاریخ بومی
  templateUrl: './complete-event-modal.component.html',
  styleUrl: './complete-event-modal.component.css',
})
export class CompleteEventModalComponent implements OnChanges {
  @Input() open = false;
  @Input() initialStart: string | null = null;
  @Input() initialEnd: string | null = null;

  @Output() confirmed = new EventEmitter<CompleteEventResult>();
  @Output() cancelled = new EventEmitter<void>();

  // تغییر به نوع Date یا رشته خالی برای همخوانی با متریال
  actualStart: Date | string = '';
  actualEnd: Date | string = '';
  error: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.actualStart = this.initialStart ? new Date(this.initialStart) : '';
      this.actualEnd = this.initialEnd ? new Date(this.initialEnd) : '';
      this.error = null;
    }
  }

  onClose(): void {
    this.open = false;
    this.cancelled.emit();
  }

  onConfirm(): void {
    if (!this.actualStart || !this.actualEnd) {
      this.error = 'fleet_schedule.event_time_required';
      return;
    }

    const startDate = new Date(this.actualStart);
    const endDate = new Date(this.actualEnd);

    if (endDate <= startDate) {
      this.error = 'fleet_schedule.event_end_before_start';
      return;
    }

    this.error = null;
    this.open = false;
    this.confirmed.emit({
      actualStartTime: moment(this.actualStart).format('YYYY-MM-DDTHH:mm:ss.000[Z]'),
      actualEndTime: moment(this.actualEnd).format('YYYY-MM-DDTHH:mm:ss.000[Z]'),
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
