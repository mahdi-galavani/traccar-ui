import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

interface MenuItem {
  titleKey: string;
  route?: string;
  icon?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  readonly isCollapsed = signal(false);
  readonly openSubmenus = signal<Record<string, boolean>>({});

  readonly menu: MenuItem[] = [
    { titleKey: 'common.dashboard', route: '/dashboard', icon: 'dashboard' },
    {
      titleKey: 'nav.operations',
      icon: 'radar',
      children: [
        { titleKey: 'nav.liveTracking', route: '/tracking' },
        { titleKey: 'nav.vehicles', route: '/vehicles' },
        { titleKey: 'nav.trackers', route: '/trackers' },
        { titleKey: 'nav.routes', route: '/routes' },
        { titleKey: 'nav.geofences', route: '/geofences' },
      ],
    },
    { titleKey: 'nav.locations', route: '/locations', icon: 'map' },
    { titleKey: 'nav.reports', route: '/reports', icon: 'report' },
    { titleKey: 'nav.personnel', route: '/personnel', icon: 'users' },
    { titleKey: 'nav.settings', route: '/base-info', icon: 'settings' },
    {
      titleKey: 'nav.accessManagement',
      icon: 'lock',
      children: [
        { titleKey: 'nav.users', route: '/users' },
        { titleKey: 'nav.roles', route: '/users/roles' },
      ],
    },
  ];

  toggleSidebar(): void {
    this.isCollapsed.update((value) => !value);
  }

  toggleSubmenu(titleKey: string, event: Event): void {
    event.stopPropagation();
    if (this.isCollapsed()) this.isCollapsed.set(false);
    this.openSubmenus.update((map) => ({ ...map, [titleKey]: !map[titleKey] }));
  }

  isSubmenuOpen(titleKey: string): boolean {
    return !!this.openSubmenus()[titleKey];
  }
}
