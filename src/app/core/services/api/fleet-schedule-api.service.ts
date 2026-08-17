import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import {
  FleetEventDto,
  FleetScheduleDto,
  FleetScheduleSearchDto,
  FleetScheduleUpdateStatusDto
} from '../../models/fleet-schedule.model';
import { FlightDto } from '../../models/flight.model';
import { SearchRequest } from '../../models/base/search-request.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';
import { toHttpParams } from '../../../shared/utils/http-params.util';
import { FlightLoadDto } from '../../../features/fleet-schedule/pages/modal/./edit-load-modal/flight.model';
import { HttpParams } from '@angular/common/http';

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

  searchByDto(dto: FleetScheduleSearchDto): Observable<FleetScheduleDto[]> {
    let params = new HttpParams();

    if (dto.from) {
      params = params.set('searchDto.from', dto.from);
    }
    if (dto.to) {
      params = params.set('searchDto.to', dto.to);
    }
    if (dto.boundaryTimes !== undefined) {
      params = params.set('searchDto.boundaryTimes', dto.boundaryTimes.toString());
    }
    if (dto.airplane?.id) {
      params = params.set('searchDto.airplane.id', dto.airplane.id);
    }
    if (dto.flight?.id) {
      params = params.set('searchDto.flight.id', dto.flight.id);
    }

    return this.http.get<FleetScheduleDto[]>(`${this.resourcePath}/search`, { params });
  }
}
