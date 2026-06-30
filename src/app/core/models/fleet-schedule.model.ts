// src/app/core/models/fleet-schedule.model.ts
import { AirplaneDto } from './airplane.model';
import { AirportCodeDto } from './airport.model';
import { FlightDto } from './flight.model';

export type FleetScheduleType = 'FLIGHT' | 'CHECK' | 'DFDR';
export type FleetScheduleStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';


export interface FleetEventDto {
  actualStartTime: string;   // ISO format
  actualEndTime: string;     // ISO format
}

export interface FleetScheduleDto {
  id?: string;
  version?: number;
  airplane: AirplaneDto | { id: string };
  departure: AirportCodeDto | { id: string };
  arrival: AirportCodeDto | { id: string };
  plannedStartTime: string;
  plannedEndTime: string;
  event?: FleetEventDto;
  type: FleetScheduleType;
  flight?: FlightDto;
  status: FleetScheduleStatus;
}

export interface FleetScheduleUpdateStatusDto {
  id: string;
  status: FleetScheduleStatus;
}

export interface ScheduleSegment {
  schedule: FleetScheduleDto;
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
}
