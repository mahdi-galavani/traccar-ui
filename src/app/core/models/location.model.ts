import { IdDtoLong } from './base/id.model';

export type LocationType = 'CONTINENT' | 'COUNTRY' | 'PROVINCE';

/** Full DTO used by /api/location/* */
export interface LocationDto {
  id?: number;
  version?: number;
  title: string;
  code: string;
  enabled?: boolean;
  parent?: IdDtoLong | null;
  type: LocationType;
}

/** lightweight reference embedded inside AirportDto */
export interface LocationCodeDto {
  id?: number;
  title?: string;
  code?: string;
}
