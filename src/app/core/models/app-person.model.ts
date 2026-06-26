import { BaseInfoCodeDto } from './airplane.model';

export interface AppPersonDto {
  id?: string;
  version?: number;
  name: string;
  family: string;
  nationalCode: string;
  phoneNumber?: string;
  job?: BaseInfoCodeDto;
  aircraftTypes?: BaseInfoCodeDto[];
}
