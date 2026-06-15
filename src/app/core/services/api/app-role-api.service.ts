import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { AppRoleDto } from '../../models/app-role.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class AppRoleApiService extends BaseApiService<AppRoleDto, string> {
  protected readonly resourcePath = API_BASE_PATH.APP_ROLE;
}
