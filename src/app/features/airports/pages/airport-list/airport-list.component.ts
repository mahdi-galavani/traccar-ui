import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { BaseCrudPage } from '../../../../shared/components/crud-page/base-crud-page';
import { AirportApiService } from '../../../../core/services/api/airport-api.service';
import { LocationApiService } from '../../../../core/services/api/location-api.service'; // 👈 اضافه شد
import { AirportDto } from '../../../../core/models/airport.model';
import { AIRPORT_COLUMNS, getAirportFields } from '../../airports.config'; // 👈 تغییر نام متد فیلدها

@Component({
  selector: 'app-airport-list',
  standalone: true,
  imports: [TranslatePipe, DataTableComponent, DynamicFormComponent],
  templateUrl: './airport-list.component.html',
})
export class AirportListComponent extends BaseCrudPage<AirportDto, string> {
  protected api = inject(AirportApiService);
  private locationApi = inject(LocationApiService); // 👈 تزریق سرویس مکان‌ها در Injection Context معتبر

  columns = AIRPORT_COLUMNS;

  // 👈 مقداردهی فیلدها با پاس دادن سرویس تزریق شده
  fields = getAirportFields(this.locationApi);

  formTitle = 'airport.form_title';
}
