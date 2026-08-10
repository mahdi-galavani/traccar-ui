import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { FlightLoadDto } from './flight.model';

@Component({
  selector: 'app-edit-load-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './edit-load-modal.component.html',
  styleUrls: ['./edit-load-modal.component.css'],
})
export class EditLoadModalComponent {
  @Input() open = false;
  @Input() flightId: string | null = null;

  @Output() saved = new EventEmitter<FlightLoadDto>();
  @Output() cancelled = new EventEmitter<void>();

  dto: FlightLoadDto = {
    firstClassSeat: 0,
    businessClassSeat: 0,
    economicClassSeat: 0,
    payload: 0,
  };

  save(form: NgForm): void {
    if (form.invalid || !this.flightId) return;
    this.saved.emit(this.dto);
  }

  cancel(): void {
    this.cancelled.emit();
  }

  // برای ریست فرم در هر بار باز شدن
  resetForm(): void {
    this.dto = { firstClassSeat: 0, businessClassSeat: 0, economicClassSeat: 0, payload: 0 };
  }
}
