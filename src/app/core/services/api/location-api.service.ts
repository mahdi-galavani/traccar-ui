import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { LocationDto } from '../../models/location.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class LocationApiService extends BaseApiService<LocationDto, number> {
  protected readonly resourcePath = API_BASE_PATH.LOCATION;

  /** Top-level nodes (continents) for the location tree. */
  loadRoot(): Observable<LocationDto[]> {
    return this.http.get<LocationDto[]>(`${this.resourcePath}/load/root`);
  }

  /** Children of a given node, used to lazily expand the tree. */
  loadByParentId(parentId: number): Observable<LocationDto[]> {
    return this.http.get<LocationDto[]>(`${this.resourcePath}/load/parent/${parentId}`);
  }
}
