import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LocationApiService } from '../../../../core/services/api/location-api.service';
import { LocationDto } from '../../../../core/models/location.model';

@Component({
  selector: 'app-location-tree',
  standalone: true,
  imports: [CommonModule,TranslatePipe],
  templateUrl: './location-tree.component.html',
  styleUrl: './location-tree.component.css',
})
export class LocationTreeComponent implements OnInit {
  /** the node this instance renders; null only for the invisible root wrapper */
  @Input() node: LocationDto | null = null;
  /** root-level instance loads top nodes itself when node is null */
  @Input() isRoot = false;

  @Output() addChild = new EventEmitter<LocationDto>();
  @Output() edit = new EventEmitter<LocationDto>();
  @Output() delete = new EventEmitter<LocationDto>();

  private api = inject(LocationApiService);

  readonly children = signal<LocationDto[]>([]);
  readonly expanded = signal(false);
  readonly loadingChildren = signal(false);

  ngOnInit(): void {
    if (this.isRoot) {
      this.loadChildren();
      this.expanded.set(true);
    }
  }

  toggle(): void {
    if (!this.expanded() && this.children().length === 0) {
      this.loadChildren();
    }
    this.expanded.set(!this.expanded());
  }

  private loadChildren(): void {
    this.loadingChildren.set(true);
    const request = this.isRoot
      ? this.api.loadRoot()
      : this.api.loadByParentId(this.node!.id!);

    request.subscribe({
      next: (data) => {
        this.children.set(data);
        this.loadingChildren.set(false);
      },
      error: () => this.loadingChildren.set(false),
    });
  }

  /** called by parent after a save/delete affecting this node's children */
  refresh(): void {
    this.children.set([]);
    this.loadChildren();
  }

  emitAddRoot(): void {
    this.addChild.emit(undefined);
  }
}
