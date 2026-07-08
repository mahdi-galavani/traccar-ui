import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

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
  providers: [provideNativeDateAdapter()],
  templateUrl: './complete-event-modal.component.html',
  styleUrl: './complete-event-modal.component.css',
})
export class CompleteEventModalComponent implements OnChanges {

  @Input() open = false;
  @Input() initialStart: string | null = null;
  @Input() initialEnd: string | null = null;

  @Output() confirmed = new EventEmitter<CompleteEventResult>();
  @Output() cancelled = new EventEmitter<void>();

  actualStart: Date | string = '';
  actualEnd: Date | string = '';

  error: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.actualStart = this.initialStart
        ? this.toLocalDate(this.initialStart)
        : '';

      this.actualEnd = this.initialEnd
        ? this.toLocalDate(this.initialEnd)
        : '';

      this.error = null;
    }
  }

  /**
   * تبدیل رشته ISO به Date بدون اعمال TimeZone
   * مثال:
   * 2026-07-08T01:30:00Z
   * =>
   * Date(2026,7,8,1,30)
   */
  private toLocalDate(value: string): Date {
    const iso = value.replace(/Z$/, '');

    const [datePart, timePart] = iso.split('T');

    const [year, month, day] = datePart.split('-').map(Number);

    const [hour = 0, minute = 0, second = 0] =
      timePart.split(':').map(Number);

    return new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second
    );
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

    const startDate = this.actualStart as Date;
    const endDate = this.actualEnd as Date;

    if (endDate <= startDate) {
      this.error = 'fleet_schedule.event_end_before_start';
      return;
    }

    this.error = null;
    this.open = false;

    this.confirmed.emit({
      actualStartTime: moment(startDate).format('YYYY-MM-DDTHH:mm:ss.000[Z]'),
      actualEndTime: moment(endDate).format('YYYY-MM-DDTHH:mm:ss.000[Z]')
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

}
