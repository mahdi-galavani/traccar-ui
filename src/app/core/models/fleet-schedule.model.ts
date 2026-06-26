// src/app/core/models/fleet-schedule.model.ts
import { AirplaneDto } from './airplane.model';
import { AirportCodeDto } from './airport.model';
import { FlightDto } from './flight.model';

export type FleetScheduleType = 'FLIGHT' | 'CHECK' | 'DFDR';
export type FleetScheduleStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface FleetScheduleDto {
  id?: string;
  version?: number;
  airplane: AirplaneDto | { id: string };
  departure: AirportCodeDto | { id: string };
  arrival: AirportCodeDto | { id: string };
  plannedStartTime: string;     // ISO date-time
  plannedEndTime: string;       // ISO date-time
  event?: any;
  type: FleetScheduleType;
  flight?: FlightDto;
  status: FleetScheduleStatus;
}

export interface FleetScheduleUpdateStatusDto {
  id: string;
  status: FleetScheduleStatus;
}
