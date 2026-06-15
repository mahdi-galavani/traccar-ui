import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { BaseInfoHeaderDto } from '../../models/base-info-header.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class BaseInfoHeaderApiService extends BaseApiService<BaseInfoHeaderDto, number> {
  protected readonly resourcePath = API_BASE_PATH.BASE_INFO_HEADER;
}
