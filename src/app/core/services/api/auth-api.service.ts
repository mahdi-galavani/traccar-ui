import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LoginRequest, LoginResponse, UserTokenDto } from '../../models/auth.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private readonly resourcePath = API_BASE_PATH.AUTH;

  login(credentials: LoginRequest): Observable<UserTokenDto> {
    // ارسال درخواست بر اساس ساختار بک‌آند و نگاشت آن به آبجکت فرانت‌آند
    return this.http.post<LoginResponse>(`${this.resourcePath}/login`, credentials).pipe(
      map((response) => {
        return {
          token: response.access_token, // تبدیل access_token به token برای هماهنگی فرانت
          username: credentials.username // ذخیره یوزرنیم وارد شده در سشن جهت استفاده در کامپوننت‌ها
        };
      })
    );
  }

  /** Authorization header is attached automatically by authInterceptor. */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.resourcePath}/logout`, {});
  }
}
