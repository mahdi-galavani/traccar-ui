import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

interface MenuItem {
  titleKey: string;
  route?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  /**
   * Temporary static menu for local testing.
   * Once the backend reliably returns UserTokenDto.authorities,
   * replace this with the dynamic tree built from AuthService.menu().
   */
  readonly menu: MenuItem[] = [
    { titleKey: 'MENU.USERS', route: '/users' },
    { titleKey: 'MENU.ROLES', route: '/users/roles' },
    { titleKey: 'MENU.AIRPLANES', route: '/airplanes' },
    { titleKey: 'MENU.AIRPORTS', route: '/airports' },
    { titleKey: 'MENU.LOCATIONS', route: '/locations' },
    { titleKey: 'MENU.BASE_INFO', route: '/base-info' },
  ];
}
