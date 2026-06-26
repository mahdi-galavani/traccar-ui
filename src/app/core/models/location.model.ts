import { IdDtoLong } from './base/id.model';

export type LocationType = 'CONTINENT' | 'COUNTRY' | 'PROVINCE' | 'CITY';

export interface LocationDto {
  id?: number;
  version?: number;
  title: string;
  code: string;
  enabled?: boolean;
  parent?: IdDtoLong | null;
  type: LocationType;
}

export interface LocationCodeDto {
  id?: number;
  title?: string;
  code?: string;
}
