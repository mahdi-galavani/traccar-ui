import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslatePipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  currentLang: string = 'en';

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    // تنظیم زبان fallback
    this.translate.setFallbackLang('en');

    // بررسی اینکه در مرورگر هستیم یا سرور
    if (isPlatformBrowser(this.platformId)) {
      // فقط در مرورگر به localStorage دسترسی داریم
      const savedLang = localStorage.getItem('language');
      const langToUse = (savedLang === 'en' || savedLang === 'fa') ? savedLang : 'en';
      this.currentLang = langToUse;
      this.translate.use(langToUse);
      this.setDirection(langToUse);
    } else {
      // در سمت سرور، از زبان پیش‌فرض استفاده کن
      this.translate.use('en');
    }
  }

  changeLanguage(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);

    // فقط در مرورگر localStorage را ذخیره کن
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', lang);
      this.setDirection(lang);
    }
  }

  private setDirection(lang: string): void {
    // فقط در مرورگر به document دسترسی داریم
    if (isPlatformBrowser(this.platformId)) {
      if (lang === 'fa') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'fa';
      } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
      }
    }
  }
}
