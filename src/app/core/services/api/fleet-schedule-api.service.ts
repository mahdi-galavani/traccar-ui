import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { FleetEventDto, FleetScheduleDto, FleetScheduleUpdateStatusDto } from '../../models/fleet-schedule.model';
import { FlightDto } from '../../models/flight.model';
import { SearchRequest } from '../../models/base/search-request.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';
import { toHttpParams } from '../../../shared/utils/http-params.util';
import { FlightLoadDto } from '../../../features/fleet-schedule/pages/modal/./edit-load-modal/flight.model';

@Injectable({ providedIn: 'root' })
export class FleetScheduleApiService extends BaseApiService<FleetScheduleDto, string> {
  protected readonly resourcePath = API_BASE_PATH.FLEET_SCHEDULE;

  /** GET /api/fleet-schedule/search?searchRequest.field=...&searchRequest.page=... */
  search(request: SearchRequest): Observable<FleetScheduleDto[]> {
    const params = toHttpParams({ searchRequest: request });
    return this.http.get<FleetScheduleDto[]>(`${this.resourcePath}/search`, { params });
  }

  /** PUT /api/fleet-schedule/update-status */
  updateStatus(dto: FleetScheduleUpdateStatusDto): Observable<void> {
    return this.http.put<void>(`${this.resourcePath}/update-status`, dto);
  }

  cancelStatus(id: string): Observable<void> {
    return this.http.put<void>( `${this.resourcePath}/cancel/${id}`, {}  );
  }



  /** GET /api/fleet-schedule/flight/load/{id} */
  loadFlightById(id: string): Observable<FlightDto> {
    return this.http.get<FlightDto>(`${API_BASE_PATH.FLIGHT}/load/${id}`);
  }

  setEvent(scheduleId: string, event: FleetEventDto): Observable<void> {
    return this.http.put<void>(`${this.resourcePath}/event/${scheduleId}`, event);
  }

  modifyLoad(id: string, dto: FlightLoadDto): Observable<void> {
    return this.http.put<void>(`${API_BASE_PATH.FLIGHT}/modify-load/${id}`, dto);
  }
}
