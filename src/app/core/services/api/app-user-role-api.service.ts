import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppUserRoleDto } from '../../models/app-role.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

/**
 * Does not extend BaseApiService: this resource has no /load or /delete
 * endpoints, only load-by-user and save.
 */
@Injectable({ providedIn: 'root' })
export class AppUserRoleApiService {
  private http = inject(HttpClient);
  private readonly resourcePath = API_BASE_PATH.APP_USER_ROLE;

  loadByUser(userId: string): Observable<AppUserRoleDto> {
    return this.http.get<AppUserRoleDto>(`${this.resourcePath}/load-by-user/${userId}`);
  }

  save(dto: AppUserRoleDto): Observable<void> {
    return this.http.post<void>(`${this.resourcePath}/save`, dto);
  }
}
