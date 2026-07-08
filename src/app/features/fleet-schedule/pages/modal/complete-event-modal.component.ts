import { Component, EventEmitter, Input, Output, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

export interface CompleteEventResult {
  actualStartTime: string;
  actualEndTime: string;
}

@Component({
  selector: 'app-complete-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './complete-event-modal.component.html',
  styleUrl: './complete-event-modal.component.css',
})
export class CompleteEventModalComponent implements OnChanges {
  @Input() open = false;
  @Input() initialStart: string | null = null;
  @Input() initialEnd: string | null = null;

  @Output() confirmed = new EventEmitter<CompleteEventResult>();
  @Output() cancelled = new EventEmitter<void>();

  actualStart = '';
  actualEnd = '';
  error: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.actualStart = this.initialStart ?? '';
      this.actualEnd = this.initialEnd ?? '';
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

    if (new Date(this.actualEnd) <= new Date(this.actualStart)) {
      this.error = 'fleet_schedule.event_end_before_start';
      return;
    }

    this.error = null;
    this.open = false;
    this.confirmed.emit({
      actualStartTime: this.actualStart,
      actualEndTime: this.actualEnd,
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
