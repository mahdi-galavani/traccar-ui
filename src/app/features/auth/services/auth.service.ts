import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthApiService } from '../../../core/services/api/auth-api.service';
import { StorageService } from '../../../core/services/storage.service';
import { STORAGE_KEYS } from '../../../shared/constants/app.constants';
import { LoginRequest, UserTokenDto } from '../../../core/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(AuthApiService);
  private storage = inject(StorageService);
  private router = inject(Router);

  private readonly _currentUser = signal<UserTokenDto | null>(
    this.storage.get<UserTokenDto>(STORAGE_KEYS.USER),
  );

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly menu = computed(() => this._currentUser()?.authorities ?? []);

  login(credentials: LoginRequest) {
    // متد مپ شده در ApiService را صدا زده و سشن را ست می‌کند
    return this.api.login(credentials).pipe(tap((result) => this.setSession(result)));
  }

  logout(): void {
    this.api.logout().subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  hasAuthority(authority: string): boolean {
    return this.menu().some((m) => m.authority === authority);
  }

  private setSession(result: UserTokenDto): void {
    this.storage.set(STORAGE_KEYS.TOKEN, result.token);
    this.storage.set(STORAGE_KEYS.USER, result);
    this._currentUser.set(result);
  }

  private clearSession(): void {
    this.storage.remove(STORAGE_KEYS.TOKEN);
    this.storage.remove(STORAGE_KEYS.USER);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
