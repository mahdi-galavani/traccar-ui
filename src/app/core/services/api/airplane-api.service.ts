import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { AirplaneDto } from '../../models/airplane.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class AirplaneApiService extends BaseApiService<AirplaneDto, string> {
  protected readonly resourcePath = API_BASE_PATH.AIRPLANE;
}
