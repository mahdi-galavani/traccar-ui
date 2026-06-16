import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PAGE_SIZE_OPTIONS } from '../../../shared/constants/app.constants';

@Component({
  selector: 'app-page-size-selector',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './page-size-selector.component.html',
  styleUrl: './page-size-selector.component.css',
})
export class PageSizeSelectorComponent {
  @Input() pageSize = PAGE_SIZE_OPTIONS[0];
  @Output() pageSizeChange = new EventEmitter<number>();

  readonly options = PAGE_SIZE_OPTIONS;

  onChange(value: string): void {
    this.pageSizeChange.emit(Number(value));
  }
}
