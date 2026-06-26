import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LocationApiService } from '../../../../core/services/api/location-api.service';
import { LocationDto, LocationType } from '../../../../core/models/location.model';

@Component({
  selector: 'app-location-tree',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './location-tree.component.html',
  styleUrl: './location-tree.component.css',
})
export class LocationTreeComponent implements OnInit {
  @Input() node: LocationDto | null = null;
  @Input() isRoot = false;

  @Output() addChild = new EventEmitter<LocationDto | null>();
  @Output() edit = new EventEmitter<LocationDto>();
  @Output() delete = new EventEmitter<LocationDto>();

  private api = inject(LocationApiService);

  readonly children = signal<LocationDto[]>([]);
  readonly loadingChildren = signal(false);
  readonly expandedNodes = signal<Record<number, boolean>>({});

  ngOnInit(): void {
    if (this.isRoot || this.node?.id) {
      this.loadChildren();
    }
  }

  canHaveChildren(type: LocationType): boolean {
    return type === 'CONTINENT' || type === 'COUNTRY' || type === 'PROVINCE';
  }

  toggle(child: LocationDto): void {
    if (!child.id || !this.canHaveChildren(child.type)) return;

    const current = !!this.expandedNodes()[child.id];
    this.expandedNodes.update((prev) => ({ ...prev, [child.id!]: !current }));
  }

  isExpanded(id?: number): boolean {
    return id ? !!this.expandedNodes()[id] : false;
  }

  loadChildren(): void {
    this.loadingChildren.set(true);
    const request = this.isRoot ? this.api.loadRoot() : this.api.loadByParentId(this.node!.id!);

    request.subscribe({
      next: (data) => {
        this.children.set(data);
        this.loadingChildren.set(false);
      },
      error: () => this.loadingChildren.set(false),
    });
  }
}
