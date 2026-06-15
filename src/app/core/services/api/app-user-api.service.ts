import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { AppUserDto } from '../../models/app-user.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class AppUserApiService extends BaseApiService<AppUserDto, string> {
  protected readonly resourcePath = API_BASE_PATH.APP_USER;
}
