import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DemoDataService } from '../../core/services/demo-data.service';

type DemoKind = 'vehicles' | 'tracking' | 'trackers' | 'routes' | 'geofences' | 'reports';

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './demo-page.component.html',
  styleUrl: './demo-page.component.css',
})
export class DemoPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly demo = inject(DemoDataService);

  readonly kind = (this.route.snapshot.data['kind'] ?? 'vehicles') as DemoKind;
  readonly titleKey = `demo.${this.kind}Title`;
  readonly descriptionKey = `demo.${this.kind}Description`;
  readonly rows = computed(() => this.demo.list<any>(this.resourceFor(this.kind)));

  readonly reportCards = [
    { icon: '◷', titleKey: 'demo.dailyReport', descriptionKey: 'demo.dailyReportDescription', tone: 'blue' },
    { icon: '⌁', titleKey: 'demo.routePerformance', descriptionKey: 'demo.routePerformanceDescription', tone: 'green' },
    { icon: '!', titleKey: 'demo.alertReport', descriptionKey: 'demo.alertReportDescription', tone: 'rose' },
  ];

  resourceFor(kind: DemoKind): string {
    return kind === 'tracking' || kind === 'vehicles' ? 'vehicle' : kind === 'trackers' ? 'tracker' : kind === 'routes' ? 'route' : kind === 'geofences' ? 'geofence' : 'event';
  }

  markerX(index: number): number {
    return [18, 54, 76, 35][index % 4];
  }

  markerY(index: number): number {
    return [29, 61, 42, 74][index % 4];
  }

  statusKey(status?: string): string {
    if (status === 'online' || status === 'active') return 'demo.statusOnline';
    if (status === 'idle' || status === 'draft') return 'demo.statusIdle';
    return 'demo.statusOffline';
  }
}
