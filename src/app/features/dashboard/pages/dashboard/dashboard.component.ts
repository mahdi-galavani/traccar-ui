import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DemoDataService } from '../../../../core/services/demo-data.service';

interface DashboardStat {
  key: string;
  value: number;
  tone: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly demo = inject(DemoDataService);

  readonly stats = computed<DashboardStat[]>(() => {
    const vehicles = this.demo.list<any>('vehicle');
    const routes = this.demo.list<any>('route');
    const events = this.demo.list<any>('event');

    return [
      { key: 'dashboard.totalVehicles', value: vehicles.length, tone: 'blue', icon: '▣' },
      { key: 'dashboard.onlineVehicles', value: vehicles.filter((item) => item.status === 'online').length, tone: 'green', icon: '⌁' },
      { key: 'dashboard.activeRoutes', value: routes.filter((item) => item.status === 'active').length, tone: 'purple', icon: '↗' },
      { key: 'dashboard.activeAlerts', value: events.filter((item) => !item.resolved).length, tone: 'amber', icon: '!' },
    ];
  });

  readonly vehicles = computed(() => this.demo.list<any>('vehicle'));
  readonly events = computed(() => this.demo.list<any>('event'));
  readonly trackerCount = computed(() => this.demo.count('tracker'));
  readonly geofenceCount = computed(() => this.demo.count('geofence'));

  statusKey(status?: string): string {
    return status === 'online' ? 'dashboard.online' : status === 'idle' ? 'dashboard.idle' : 'dashboard.offline';
  }

  severityKey(severity?: string): string {
    return severity === 'critical' ? 'dashboard.critical' : severity === 'warning' ? 'dashboard.warning' : 'dashboard.info';
  }
}
