import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { AppMenuDto } from '../../models/app-menu.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class AppMenuApiService extends BaseApiService<AppMenuDto, string> {
  protected readonly resourcePath = API_BASE_PATH.APP_MENU;
}
