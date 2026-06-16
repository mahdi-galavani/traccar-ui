import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { SUPPORTED_LANGS } from '../../../shared/constants/app.constants';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css',
})
export class LanguageSelectorComponent {
  language = inject(LanguageService);
  readonly languages = SUPPORTED_LANGS;

  select(lang: string): void {
    this.language.use(lang as any);
  }
}
