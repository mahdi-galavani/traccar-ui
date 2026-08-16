import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

import { FleetScheduleDto } from '../../../core/models/fleet-schedule.model';
import { AppPersonDto } from '../../../core/models/app-person.model';

@Component({
  selector: 'app-modal-info',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './modal-info.component.html',
  styleUrl: './modal-info.component.css',
})
export class ModalInfo {
  // =========================================================
  // INPUTS
  // =========================================================

  @Input() selectedSchedule: FleetScheduleDto | null = null;
  @Input() selectedPilot: AppPersonDto | null = null;
  @Input() pilotLoading = false;

  // =========================================================
  // OUTPUTS
  // =========================================================

  @Output() close = new EventEmitter<void>();

  @Output() loadPilot = new EventEmitter<string>();

  // =========================================================
  // MODAL
  // =========================================================

  closeModal(): void {
    this.close.emit();
  }

  // =========================================================
  // PILOT
  // =========================================================

  selectPilot(personId: string | undefined): void {
    if (!personId) {
      return;
    }

    this.loadPilot.emit(personId);
  }

  getPilotFullName(): string {
    if (!this.selectedPilot) {
      return '-';
    }

    return `${this.selectedPilot.name || ''} ${this.selectedPilot.family || ''}`.trim();
  }

  getPilotInitials(): string {
    if (!this.selectedPilot) {
      return '👨‍✈️';
    }

    const first = this.selectedPilot.name?.charAt(0)?.toUpperCase() || '';

    const last = this.selectedPilot.family?.charAt(0)?.toUpperCase() || '';

    return `${first}${last}` || '👨‍✈️';
  }

  // =========================================================
  // TYPE HELPERS
  // =========================================================

  getTypeIcon(type: string): string {
    switch (type) {
      case 'FLIGHT':
        return '✈';

      case 'CHECK':
        return '🔧';

      case 'DFDR':
        return '📦';

      default:
        return '•';
    }
  }

  // =========================================================
  // AIRPORT
  // =========================================================

  getAirportCode(airport: any): string {
    if (!airport) {
      return '---';
    }

    return airport.code || airport.id?.substring(0, 4) || 'N/A';
  }

  // =========================================================
  // AIRCRAFT
  // =========================================================

  getAirplaneRegister(airplane: any): string {
    if (!airplane) {
      return 'A/C';
    }

    return airplane.register || airplane.id || 'A/C';
  }

  // =========================================================
  // DATE
  // =========================================================

  formatFullDate(value: string | undefined): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleString();
  }

  // =========================================================
  // TIME DEVIATION
  // =========================================================

  getTimeDeviation(schedule: FleetScheduleDto): number | null {
    if (!schedule.event?.actualStartTime) {
      return null;
    }

    const planned = new Date(schedule.plannedStartTime).getTime();

    const actual = new Date(schedule.event.actualStartTime).getTime();

    return (actual - planned) / 60000;
  }

  // =========================================================
  // FORMAT DEVIATION
  // =========================================================

  formatDeviation(deviation: number | null): string {
    if (deviation === null) {
      return '---';
    }

    const sign = deviation > 0 ? '+' : '';

    const abs = Math.abs(deviation);

    const hours = Math.floor(abs / 60);

    const minutes = Math.round(abs % 60);

    if (hours > 0) {
      return `${sign}${hours}h ${minutes}m`;
    }

    return `${sign}${minutes}m`;
  }

  // =========================================================
  // DEVIATION COLOR
  // =========================================================

  getDeviationColor(deviation: number | null): string {
    if (deviation === null) {
      return '#6b7280';
    }

    if (deviation === 0) {
      return '#22c55e';
    }

    if (deviation > 0 && deviation <= 15) {
      return '#eab308';
    }

    if (deviation > 15) {
      return '#ef4444';
    }

    return '#3b82f6';
  }
}
