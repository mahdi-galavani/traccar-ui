import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { FlightClockComponent } from '../../shared/components/flight-clock/flight-clock.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslatePipe, LanguageSelectorComponent, FlightClockComponent], // 👈 کامپوننت ساعت اینجا اضافه شد
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly currentUser = this.auth.currentUser;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']); // انتقال به صفحه لاگین پس از خروج موفق
  }
}
