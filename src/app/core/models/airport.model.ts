import { IdDtoLong } from './base/id.model';
import { LocationCodeDto } from './location.model';

export interface AirportDto {
  id?: string;
  version?: number;
  code?: string;
  name?: string;
  internal?: boolean;
  location?: LocationCodeDto;
}

export interface AirportCodeDto {
  id?: string;
  version?: number;
  code?: string;
  location?: IdDtoLong;
}
