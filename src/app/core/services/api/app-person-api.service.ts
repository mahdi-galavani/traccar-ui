import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { AppPersonDto } from '../../models/app-person.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class AppPersonApiService extends BaseApiService<AppPersonDto, string> {
  protected readonly resourcePath = API_BASE_PATH.APP_PERSON;
}
