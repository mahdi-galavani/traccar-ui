import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { Observable, map, tap, catchError } from 'rxjs';
import { LoginRequest, LoginResponse, UserTokenDto } from '../../models/auth.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly resourcePath = API_BASE_PATH.AUTH;

  login(credentials: LoginRequest): Observable<UserTokenDto> {
    const isServer = isPlatformServer(this.platformId);
    const fullUrl = `${this.resourcePath}/login`;

    // مشخص کردن اینکه لاگ مربوط به SSR (Node.js) است یا مرورگر (Browser)
    const context = isServer ? '🚀 [SSR Server]' : '💻 [Browser Client]';

    console.log(`${context} Attempting login...`);
    console.log(`${context} Target URL:`, fullUrl);
    // رمز عبور را برای امنیت در لاگ ماسک می‌کنیم اما ارسال واقعی تغییر نمی‌کند
    console.log(`${context} Payload:`, { ...credentials, password: '***' });

    return this.http.post<LoginResponse>(fullUrl, credentials).pipe(
      tap({
        next: (response) => {
          console.log(`${context} ✅ Login response received successfully:`, response);
        },
        error: (error) => {
          console.error(`${context} ❌ Login failed! Error details:`, {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            errorBody: error.error
          });
        }
      }),
      map((response) => {
        return {
          token: response.access_token,
          username: credentials.username
        };
      }),
      catchError((err) => {
        // پرتاب مجدد خطا برای اینکه کامپوننت هم بتواند ریکشن نشان دهد
        throw err;
      })
    );
  }

  /** Authorization header is attached automatically by authInterceptor. */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.resourcePath}/logout`, {});
  }
}
