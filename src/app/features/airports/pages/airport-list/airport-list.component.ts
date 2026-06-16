import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { BaseCrudPage } from '../../../../shared/components/crud-page/base-crud-page';
import { AirportApiService } from '../../../../core/services/api/airport-api.service';
import { AirportDto } from '../../../../core/models/airport.model';
import { AIRPORT_COLUMNS, AIRPORT_FIELDS } from '../../airports.config';

@Component({
  selector: 'app-airport-list',
  standalone: true,
  imports: [TranslatePipe, DataTableComponent, DynamicFormComponent],
  templateUrl: './airport-list.component.html',
})
export class AirportListComponent extends BaseCrudPage<AirportDto, string> {
  protected api = inject(AirportApiService);
  columns = AIRPORT_COLUMNS;
  fields = AIRPORT_FIELDS;
  formTitle = 'AIRPORT.FORM_TITLE';
}
