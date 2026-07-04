import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import * as fs from 'fs';
import { join } from 'path';

export class TranslateServerLoader implements TranslateLoader {
  constructor(
    private prefix: string = 'assets/i18n/',
    private suffix: string = '.json'
  ) {}

  getTranslation(lang: string): Observable<any> {
    const browserPath = join(process.cwd(), 'dist/airport-management-ui/browser', this.prefix, `${lang}${this.suffix}`);

    try {
      const content = fs.readFileSync(browserPath, 'utf8');
      return of(JSON.parse(content));
    } catch (err) {
      console.error(`[TranslateServerLoader] File not found for ${lang}:`, browserPath);
      return of({});
    }
  }
}
