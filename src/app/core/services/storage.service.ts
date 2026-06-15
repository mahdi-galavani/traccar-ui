import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** SSR-safe wrapper around localStorage. */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  get<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  set(key: string, value: unknown): void {
    if (!this.isBrowser) return;
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, raw);
  }

  remove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
  }
}
