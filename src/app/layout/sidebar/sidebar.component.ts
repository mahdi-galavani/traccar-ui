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
    // 👈 ایجاد آیتم والد برای مدیریت دسترسی (بدون روت مستقیم، همراه با فرزند)
    {
      titleKey: 'nav.accessManagement',
      icon: 'lock',
      children: [
        { titleKey: 'nav.users', route: '/users' },
        { titleKey: 'nav.roles', route: '/users/roles' },
      ]
    },
    { titleKey: 'nav.airplanes', route: '/airplanes', icon: 'plane' },
    { titleKey: 'nav.airports', route: '/airports', icon: 'map-pin' },
    { titleKey: 'nav.locations', route: '/locations', icon: 'globe' },
    { titleKey: 'nav.baseInfo', route: '/base-info', icon: 'database' },
    { titleKey: 'nav.fleetSchedule', route: '/fleet-schedule', icon: 'calendar' },
    { titleKey: 'nav.fleetTimeline', route: '/fleet-timeline', icon: 'clock' },
  ];

  toggleSidebar(): void {
    this.isCollapsed.update((val) => !val);
  }

  toggleSubmenu(titleKey: string, event: Event): void {
    event.stopPropagation();
    if (this.isCollapsed()) {
      this.isCollapsed.set(false);
    }

    this.openSubmenus.update((map) => ({
      ...map,
      [titleKey]: !map[titleKey],
    }));
  }

  isSubmenuOpen(titleKey: string): boolean {
    return !!this.openSubmenus()[titleKey];
  }
}
