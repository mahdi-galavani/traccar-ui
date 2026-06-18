import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { LocationDto } from '../../models/location.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class LocationApiService extends BaseApiService<LocationDto, number> {
  // مقدار پیش‌فرض آن احتمالاً '/api/location' است
  protected override readonly resourcePath = API_BASE_PATH.LOCATION;

  /** * دریافت لوکیشن‌های سطح ریشه (قاره‌ها)
   * منطبق با GET /api/location/load-root در Swagger بک‌اند
   */
  loadRoot(): Observable<LocationDto[]> {
    return this.http.get<LocationDto[]>(`${this.resourcePath}/load/root`);
  }

  /** * دریافت فرزندان یک لوکیشن بر اساس آیدی پدر
   * منطبق با GET /api/location/load-by-parent-id/{parentId} در Swagger بک‌اند
   */
  loadByParentId(parentId: number): Observable<LocationDto[]> {
    return this.http.get<LocationDto[]>(`${this.resourcePath}/load/parent/${parentId}`);
  }
}
