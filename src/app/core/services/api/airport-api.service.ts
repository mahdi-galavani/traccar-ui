import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { AirportDto } from '../../models/airport.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class AirportApiService extends BaseApiService<AirportDto, string> {
  protected readonly resourcePath = API_BASE_PATH.AIRPORT;
}
