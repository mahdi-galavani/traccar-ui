import { IdDtoLong } from './base/id.model';

/** Full DTO used by /api/base-info/* (lookup items, linked to a header) */
export interface BaseInfoDto {
  id?: number;
  version?: number;
  title: string;
  code: string;
  description?: string;
  header: IdDtoLong;
}
