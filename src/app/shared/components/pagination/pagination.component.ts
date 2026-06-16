import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  @Input() page = 0; // zero-based, matches SearchRequest.page
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  readonly canPrev = computed(() => this.page > 0);
  readonly canNext = computed(() => this.page < this.totalPages - 1);

  prev(): void {
    if (this.canPrev()) this.pageChange.emit(this.page - 1);
  }

  next(): void {
    if (this.canNext()) this.pageChange.emit(this.page + 1);
  }
}
