import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, UserTokenDto } from '../../models/auth.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private readonly resourcePath = API_BASE_PATH.AUTH;

  login(credentials: LoginRequest): Observable<UserTokenDto> {
    return this.http.post<UserTokenDto>(`${this.resourcePath}/login`, credentials);
  }

  /** Authorization header is attached automatically by authInterceptor. */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.resourcePath}/logout`, {});
  }
}
