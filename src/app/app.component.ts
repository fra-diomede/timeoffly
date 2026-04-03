import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationBannerComponent } from './core/components/notification-banner/notification-banner.component';
import { SeoService } from './core/services/seo.service';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, NotificationBannerComponent]
})
export class AppComponent {
  private readonly seoService = inject(SeoService);
}
