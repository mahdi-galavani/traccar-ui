import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, map } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BaseInfoDto } from '../../models/base-info.model';
import { BaseInfoHeaderApiService } from './base-info-header-api.service';
import { SelectOption } from '../../models/base/crud-field.model';
import { API_BASE_PATH } from '../../../shared/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class BaseInfoApiService extends BaseApiService<BaseInfoDto, number> {
  protected readonly resourcePath = API_BASE_PATH.BASE_INFO;

  private headerApi = inject(BaseInfoHeaderApiService);

  /**
   * Loads base-info items belonging to the header with the given code,
   * mapped to SelectOption[] for use directly in dynamic-form 'select' fields.
   * Used by CRUD configs for vehicle, route, alert, and personnel lookups.
   */
  loadOptionsByHeaderCode(headerCode: string): Observable<SelectOption[]> {
    return this.headerApi.load().pipe(
      switchMap((headers) => {
        const header = headers.find((h) => h.title === headerCode || h.code === headerCode);
        if (!header?.id) {
          return of<SelectOption[]>([]);
        }
        return this.load().pipe(
          map((items) =>
            items
              .filter((item) => item.header?.id === header.id)
              .map((item) => {
                // 💡 فرمت‌دهی زیبا برای لِیبل: اگر توضیحات بود داخل پرانتز می‌آید، در غیر این صورت فقط عنوان
                const labelText = item.description
                  ? `${item.title} (${item.description})`
                  : (item.title ?? '');

                return {
                  label: labelText,
                  value: item.id
                };
              }),
          ),
        );
      }),
    );
  }
}
