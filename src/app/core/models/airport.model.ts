import { IdDtoLong } from './base/id.model';
import { LocationCodeDto } from './location.model';

/** Full DTO used by /api/airport/* */
export interface AirportDto {
  id?: string;
  version?: number;
  code?: string;
  location?: LocationCodeDto;
}

/** lightweight reference embedded inside FlightDto.from / FlightDto.to */
export interface AirportCodeDto {
  id?: string;
  version?: number;
  code?: string;
  location?: IdDtoLong;
}
