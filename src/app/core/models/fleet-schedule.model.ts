import { IdDtoString } from './base/id.model';
import { FlightDto } from './flight.model';

export type FleetScheduleType = 'FLIGHT' | 'CHECK' | 'DFDR';
export type FleetScheduleStatus = 'DRAFT' | 'SCHEDULED' | 'CANCELLED';

/** Full DTO used by /api/fleet-schedule/* */
export interface FleetScheduleDto {
  id?: string;
  version?: number;
  airplane: IdDtoString;
  actualStartTime: string; // ISO date-time
  actualEndTime: string;   // ISO date-time
  event?: IdDtoString;
  type: FleetScheduleType;
  flight?: FlightDto;
  status: FleetScheduleStatus;
}

/** Payload for PUT /api/fleet-schedule/update-status */
export interface FleetScheduleUpdateStatusDto {
  id: string;
  status: FleetScheduleStatus;
}
