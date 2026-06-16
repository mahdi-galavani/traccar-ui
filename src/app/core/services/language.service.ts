import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import {
  DEFAULT_LANG,
  RTL_LANGS,
  STORAGE_KEYS,
  SupportedLang,
} from '../../shared/constants/app.constants';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  private storage = inject(StorageService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly current = signal<SupportedLang>(
    this.storage.get<SupportedLang>(STORAGE_KEYS.LANG) ?? DEFAULT_LANG,
  );

  /** Called once from an app initializer (see app.config.ts). */
  init(): void {
    this.use(this.current());
  }

  use(lang: SupportedLang): void {
    this.translate.use(lang);
    this.storage.set(STORAGE_KEYS.LANG, lang);
    this.current.set(lang);
    this.applyDirection(lang);
  }

  isRtl(lang: SupportedLang = this.current()): boolean {
    return RTL_LANGS.includes(lang);
  }

  private applyDirection(lang: SupportedLang): void {
    if (!this.isBrowser) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = this.isRtl(lang) ? 'rtl' : 'ltr';
  }
}
