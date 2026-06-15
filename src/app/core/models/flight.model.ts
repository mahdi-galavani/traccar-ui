import { AirportCodeDto } from './airport.model';
import { AppPersonDto } from './app-person.model';
import { BaseInfoDto } from './base-info.model';

/** A single crew member assignment (person + role) */
export interface FlightCrewDto {
  id?: string;
  version?: number;
  person: AppPersonDto;
  crewJob: BaseInfoDto;
}

/** Full flight details, nested inside FleetScheduleDto.flight */
export interface FlightDto {
  id?: string;
  version?: number;
  number: string;
  from: AirportCodeDto;
  to: AirportCodeDto;
  firstClassSeat?: number;
  businessClassSeat?: number;
  economicClassSeat?: number;
  payload?: number;
  /** minItems: 1 in the API spec */
  crew: FlightCrewDto[];
}
