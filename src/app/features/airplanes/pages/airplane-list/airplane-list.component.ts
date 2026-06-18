import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { BaseCrudPage } from '../../../../shared/components/crud-page/base-crud-page';
import { AirplaneApiService } from '../../../../core/services/api/airplane-api.service';
import { AirplaneDto } from '../../../../core/models/airplane.model';
import { AIRPLANE_COLUMNS, getAirplaneFields } from '../../airplanes.config';
import { BaseInfoApiService } from '../../../../core/services/api/base-info-api.service';

@Component({
  selector: 'app-airplane-list',
  standalone: true,
  imports: [TranslatePipe, DataTableComponent, DynamicFormComponent],
  templateUrl: './airplane-list.component.html',
})
export class AirplaneListComponent extends BaseCrudPage<AirplaneDto, string> {
  protected api = inject(AirplaneApiService);
  private baseInfoApi = inject(BaseInfoApiService);
  columns = AIRPLANE_COLUMNS;
  fields = getAirplaneFields(this.baseInfoApi);
  formTitle = 'airplane.form_title';
}
